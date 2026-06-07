import type { MCQQuestion, CodingQuestion, DifficultyLevel } from '../types';

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

// ── Question generation ─────────────────────────────────────────────────────

export async function generateQuestion(
  conceptId: string,
  conceptLabel: string,
  conceptTagline: string,
  level: DifficultyLevel,
  mode: 'mcq' | 'coding',
): Promise<MCQQuestion | CodingQuestion> {
  const req: GenerateRequest = {
    conceptId,
    conceptLabel,
    conceptTagline,
    level,
    type: mode === 'mcq' ? 'MCQ' : 'CODING',
  };

  const res = await fetch('/api/questions/generate', {
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
  let cancelled = false;

  (async () => {
    try {
      const res = await fetch('/api/grade', {
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
