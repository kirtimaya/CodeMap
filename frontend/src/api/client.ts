import type { MCQQuestion, CodingQuestion, DifficultyLevel } from '../types';
import { getQuestionsForConcept, SEED_MCQ, SEED_CODING } from '../content/seedQuestions';

// In dev: Vite proxies /api → localhost:8080 (see vite.config.ts)
// In prod: VITE_API_BASE_URL=https://your-oci-ip points to the OCI backend
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

// Set VITE_MOCK_API=true in .env to run the frontend without a backend.
const MOCK_API = import.meta.env.VITE_MOCK_API === 'true';

// ── Request / response shapes matching the Spring Boot backend ──────────────

interface GenerateRequest {
  conceptId: string;
  conceptLabel: string;
  conceptTagline: string;
  level: DifficultyLevel;
  type: 'MCQ' | 'CODING';
}

interface McqPayload {
  type: 'MCQ';
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface CodingPayload {
  type: 'CODING';
  prompt: string;
  starterCode: string;
  rubric: string;
  hints: string[];
}

type QuestionPayload = McqPayload | CodingPayload;

export interface GradeRequest {
  conceptId: string;
  conceptLabel: string;
  level: DifficultyLevel;
  userCode: string;
  prompt: string;
  rubric: string;
}

// ── Mock helpers (used when VITE_MOCK_API=true) ─────────────────────────────

function mockQuestion(
  conceptId: string,
  conceptLabel: string,
  level: DifficultyLevel,
  mode: 'mcq' | 'coding',
): MCQQuestion | CodingQuestion {
  // Prefer any seed that matches this concept
  const seeds = getQuestionsForConcept(conceptId, level, mode);
  if (seeds.length > 0) {
    return seeds[Math.floor(Math.random() * seeds.length)];
  }

  // Generic fallback when the concept has no seed
  if (mode === 'mcq') {
    const pool = SEED_MCQ.filter((q) => q.level === level);
    const base = pool[Math.floor(Math.random() * pool.length)] ?? SEED_MCQ[0];
    return {
      ...base,
      id: `mock-mcq-${conceptId}-${level}-${Date.now()}`,
      conceptId,
      question: `Which statement about ${conceptLabel} is most accurate?`,
      options: [
        `${conceptLabel} is unavailable before Java 17`,
        `${conceptLabel} is a core part of the Java/Spring ecosystem`,
        `${conceptLabel} cannot be used with dependency injection`,
        `${conceptLabel} always requires external configuration`,
      ],
      correctIndex: 1,
      explanation: `${conceptLabel} is a fundamental concept in the Java ecosystem. (Offline seed question — connect the backend for AI-generated questions.)`,
    } satisfies MCQQuestion;
  } else {
    const base = SEED_CODING[Math.floor(Math.random() * SEED_CODING.length)];
    return {
      ...base,
      id: `mock-coding-${conceptId}-${level}-${Date.now()}`,
      conceptId,
      prompt: `Demonstrate your understanding of **${conceptLabel}** by writing a short illustrative example.\n\nFocus on the core behaviour that makes ${conceptLabel} interesting or useful.`,
      starterCode: `// ${conceptLabel} example\npublic class Example {\n    public static void main(String[] args) {\n        // Your implementation here\n    }\n}`,
      rubric: `Award marks for: correct use of ${conceptLabel} APIs, clear variable names, and handling of edge cases.`,
      hints: [
        `Think about the primary reason developers reach for ${conceptLabel}`,
        `Consider what could go wrong and how to guard against it`,
      ],
    } satisfies CodingQuestion;
  }
}

function mockGradeStream(
  req: GradeRequest,
  onToken: (token: string) => void,
  onDone: () => void,
  _onError: (err: Error) => void,
): () => void {
  let cancelled = false;

  const code = req.userCode.trim();
  const incomplete = code.includes('// TODO') || code.includes('return null') || code.length < 80;

  const feedback = incomplete
    ? `Your solution for **${req.conceptLabel}** is incomplete.\n\n` +
      `**Evaluation:**\n` +
      `- Correctness: There are still TODO placeholders or trivially empty methods — fill these in.\n` +
      `- Code structure: The scaffolding is in place; implement the body of each method.\n` +
      `- Concepts applied: Review the hints and rubric for guidance on what's expected.\n\n` +
      `**Overall:** Keep going — complete the implementation and submit again.`
    : `Great effort on **${req.conceptLabel}**!\n\n` +
      `**Evaluation:**\n` +
      `- Correctness: Your implementation covers the core logic correctly.\n` +
      `- Code structure: The code is clear and well organised.\n` +
      `- Concepts applied: You've demonstrated solid understanding of the key principles.\n\n` +
      `**Overall:** Well done! This is a solid solution.`;

  const words = feedback.split(' ');
  let i = 0;

  const id = setInterval(() => {
    if (cancelled) { clearInterval(id); return; }
    if (i < words.length) {
      onToken((i > 0 ? ' ' : '') + words[i]);
      i++;
    } else {
      clearInterval(id);
      if (!cancelled) onDone();
    }
  }, 25);

  return () => { cancelled = true; clearInterval(id); };
}

// ── Question generation ─────────────────────────────────────────────────────

export async function generateQuestion(
  conceptId: string,
  conceptLabel: string,
  conceptTagline: string,
  level: DifficultyLevel,
  mode: 'mcq' | 'coding',
): Promise<MCQQuestion | CodingQuestion> {
  if (MOCK_API) {
    return mockQuestion(conceptId, conceptLabel, level, mode);
  }

  const req: GenerateRequest = {
    conceptId,
    conceptLabel,
    conceptTagline,
    level,
    type: mode === 'mcq' ? 'MCQ' : 'CODING',
  };

  const res = await fetch(`${API_BASE}/api/questions/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Question generation failed (${res.status}): ${text}`);
  }

  const payload: QuestionPayload = await res.json();

  const base = { conceptId, level };
  if (payload.type === 'MCQ') {
    return {
      ...base,
      id: `api-mcq-${conceptId}-${level}-${Date.now()}`,
      type: 'mcq',
      question: payload.question,
      options: payload.options,
      correctIndex: payload.correctIndex,
      explanation: payload.explanation,
    } satisfies MCQQuestion;
  } else {
    return {
      ...base,
      id: `api-coding-${conceptId}-${level}-${Date.now()}`,
      type: 'coding',
      prompt: payload.prompt,
      starterCode: payload.starterCode,
      rubric: payload.rubric,
      hints: payload.hints,
    } satisfies CodingQuestion;
  }
}

// ── Grade streaming ─────────────────────────────────────────────────────────
// Returns a cancel function. Calls onToken for each streamed token,
// onDone when the stream closes cleanly, onError on failure.

export function gradeStream(
  req: GradeRequest,
  onToken: (token: string) => void,
  onDone: () => void,
  onError: (err: Error) => void,
): () => void {
  if (MOCK_API) {
    return mockGradeStream(req, onToken, onDone, onError);
  }

  let cancelled = false;

  (async () => {
    try {
      const res = await fetch(`${API_BASE}/api/grade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
        body: JSON.stringify(req),
      });

      if (!res.ok) {
        throw new Error(`Grading request failed (${res.status})`);
      }
      if (!res.body) throw new Error('No response body from grading endpoint');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (!cancelled) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        // SSE lines look like: "data: <token>\n\n"
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
          if (line.startsWith('data:')) {
            const token = line.slice(5).trim();
            if (token) onToken(token);
          }
        }
      }

      if (!cancelled) onDone();
    } catch (err) {
      if (!cancelled) onError(err instanceof Error ? err : new Error(String(err)));
    }
  })();

  return () => {
    cancelled = true;
  };
}
