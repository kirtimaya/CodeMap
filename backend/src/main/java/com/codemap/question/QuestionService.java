package com.codemap.question;

import com.codemap.llm.QuestionGenerator;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.micrometer.core.annotation.Timed;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Orchestrates question retrieval and generation.
 *
 * Teaching note: @Timed on every public method instruments them with a
 * Micrometer Timer automatically via the TimedAspect AOP bean. The metric
 * appears at /actuator/prometheus as 'questions_*_seconds'. This is the same
 * AOP proxy mechanism explained in the AOPProxyViz visualization.
 *
 * Cache strategy: generated questions are persisted in Postgres so identical
 * {conceptId, level, type} combinations are served from DB on subsequent
 * requests instead of calling the LLM again. This reduces latency and cost.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class QuestionService {

    private final QuestionRepository questionRepository;
    private final QuestionGenerator questionGenerator;
    private final ObjectMapper objectMapper;

    /**
     * Generate or retrieve a cached question for the given concept/level/type.
     * If a generated question already exists for this triple, returns it immediately.
     */
    @Timed(value = "questions.generate", description = "Time to generate or retrieve a question")
    @Transactional
    public QuestionPayload generateOrRetrieve(GenerateRequest req) {
        // Check cache first — avoid calling the LLM for repeated requests
        boolean cached = questionRepository.existsByConceptIdAndLevelAndTypeAndSource(
                req.conceptId(), req.level(), req.type(), "generated"
        );

        if (cached) {
            log.debug("Cache hit for concept={} level={} type={}", req.conceptId(), req.level(), req.type());
            Question existing = questionRepository
                    .findFirstByConceptIdAndLevelAndType(req.conceptId(), req.level(), req.type())
                    .orElseThrow();
            return deserialize(existing.getPayloadJson(), req.type());
        }

        log.info("Cache miss — generating new {} L{} question for '{}'", req.type(), req.level(), req.conceptId());
        QuestionPayload payload = questionGenerator.generate(req);

        Question saved = Question.builder()
                .conceptId(req.conceptId())
                .level(req.level())
                .type(req.type())
                .payloadJson(serialize(payload))
                .source("generated")
                .build();
        questionRepository.save(saved);

        return payload;
    }

    /**
     * Returns curated (hand-written) questions for a concept, or all questions
     * if no curated set exists.
     */
    @Timed(value = "questions.curated", description = "Time to retrieve curated questions")
    @Transactional(readOnly = true)
    public List<QuestionPayload> getCurated(String conceptId, int level, QuestionType type) {
        List<Question> questions = questionRepository
                .findByConceptIdAndLevelAndType(conceptId, level, type);

        if (questions.isEmpty()) {
            questions = questionRepository.findByConceptIdAndType(conceptId, type);
        }

        return questions.stream()
                .map(q -> deserialize(q.getPayloadJson(), q.getType()))
                .toList();
    }

    private String serialize(QuestionPayload payload) {
        try {
            return objectMapper.writeValueAsString(payload);
        } catch (Exception e) {
            throw new IllegalStateException("Failed to serialize question payload", e);
        }
    }

    private QuestionPayload deserialize(String json, QuestionType type) {
        try {
            return switch (type) {
                case MCQ -> objectMapper.readValue(json, QuestionPayload.McqPayload.class);
                case CODING -> objectMapper.readValue(json, QuestionPayload.CodingPayload.class);
            };
        } catch (Exception e) {
            throw new IllegalStateException("Failed to deserialize question payload", e);
        }
    }
}
