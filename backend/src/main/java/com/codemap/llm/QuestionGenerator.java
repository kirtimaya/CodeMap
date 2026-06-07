package com.codemap.llm;

import com.codemap.question.GenerateRequest;
import com.codemap.question.QuestionPayload;
import com.codemap.question.QuestionType;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * Generates interview questions by calling the Gemini API.
 *
 * Teaching note: This component is responsible for prompt engineering —
 * translating a structured GenerateRequest into a precise LLM prompt,
 * and parsing the JSON response back into a typed QuestionPayload.
 *
 * The LEVEL_DESCRIPTIONS map keeps difficulty language consistent between
 * the frontend DifficultySelector and the prompts sent to Gemini.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class QuestionGenerator {

    private final GeminiClient geminiClient;
    private final ObjectMapper objectMapper;

    private static final Map<Integer, String> LEVEL_DESCRIPTIONS = Map.of(
            1, "Fundamentals — core terminology, basic definitions, 'what is X' questions. No coding required.",
            2, "Junior — how and why questions. Basic usage patterns. Simple code reading.",
            3, "Mid-level — trade-off analysis, common pitfalls, and moderately complex coding problems.",
            4, "Senior — deep internals, performance implications, and real-world architectural decisions.",
            5, "Expert — JVM internals, edge cases, distributed systems nuances. Expert-level coding challenges."
    );

    public QuestionPayload generate(GenerateRequest req) {
        log.debug("Generating {} L{} question for concept '{}'", req.type(), req.level(), req.conceptId());
        String rawJson = geminiClient.generateContent(systemPrompt(), buildPrompt(req));
        return parsePayload(rawJson, req.type());
    }

    private String systemPrompt() {
        return """
                You are an expert Java and Spring Boot interviewer with deep knowledge of JVM internals,
                concurrency, Spring framework internals, and distributed systems.
                You generate precise, accurate technical interview questions.
                Always return ONLY valid JSON — no markdown fences, no explanation outside the JSON.
                """;
    }

    private String buildPrompt(GenerateRequest req) {
        String levelDesc = LEVEL_DESCRIPTIONS.getOrDefault(req.level(), "Mid-level");
        return switch (req.type()) {
            case MCQ -> """
                    Generate a multiple-choice question for the concept "%s" (%s).
                    Difficulty: Level %d/5 — %s

                    The question should specifically test understanding of: %s

                    Return ONLY this JSON structure:
                    {
                      "question": "...",
                      "options": ["option A", "option B", "option C", "option D"],
                      "correctIndex": 0,
                      "explanation": "Why the correct answer is correct, and why the others are wrong."
                    }
                    """.formatted(req.conceptLabel(), req.conceptId(), req.level(), levelDesc, req.conceptTagline());

            case CODING -> """
                    Generate a coding challenge for the concept "%s" (%s).
                    Difficulty: Level %d/5 — %s

                    The challenge should specifically test understanding of: %s

                    Return ONLY this JSON structure:
                    {
                      "prompt": "Problem description with requirements (multiline string)",
                      "starterCode": "Java starter code with TODO comments",
                      "rubric": "Grading criteria with point values",
                      "hints": ["hint 1", "hint 2", "hint 3"],
                      "exampleSolution": "Complete working Java solution (hidden from user)"
                    }
                    """.formatted(req.conceptLabel(), req.conceptId(), req.level(), levelDesc, req.conceptTagline());
        };
    }

    private QuestionPayload parsePayload(String json, QuestionType type) {
        String cleaned = json.strip();
        if (cleaned.startsWith("```")) {
            cleaned = cleaned.replaceFirst("```[a-z]*\\n?", "").replaceFirst("```$", "").strip();
        }
        try {
            // The LLM returns JSON without the @JsonTypeInfo discriminator field.
            // Inject it so Jackson can deserialize to the correct QuestionPayload subtype.
            ObjectNode node = (ObjectNode) objectMapper.readTree(cleaned);
            node.put("type", type.name()); // "MCQ" or "CODING"
            return objectMapper.treeToValue(node, QuestionPayload.class);
        } catch (Exception e) {
            throw new LlmException("Failed to parse LLM response as " + type + " payload: " + e.getMessage());
        }
    }
}
