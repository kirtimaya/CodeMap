package com.codemap.question;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for question generation and retrieval.
 *
 * Teaching note: @RestController = @Controller + @ResponseBody. Every method
 * return value is serialized to JSON by Jackson's MappingJackson2HttpMessageConverter.
 * @Validated enables method-level constraint validation (query params).
 *
 * This controller is intentionally thin — business logic lives in QuestionService.
 */
@RestController
@RequestMapping("/api/questions")
@RequiredArgsConstructor
@Validated
public class QuestionController {

    private final QuestionService questionService;

    /**
     * POST /api/questions/generate
     * Generates a new question via Claude or returns a cached one.
     */
    @PostMapping("/generate")
    public ResponseEntity<QuestionPayload> generate(@Valid @RequestBody GenerateRequest request) {
        QuestionPayload payload = questionService.generateOrRetrieve(request);
        return ResponseEntity.ok(payload);
    }

    /**
     * GET /api/questions/curated?conceptId=gc-heap-structure&level=2&type=MCQ
     * Returns hand-curated questions for a concept at the requested level.
     */
    @GetMapping("/curated")
    public ResponseEntity<List<QuestionPayload>> curated(
            @RequestParam @NotBlank String conceptId,
            @RequestParam @Min(1) @Max(5) int level,
            @RequestParam QuestionType type
    ) {
        List<QuestionPayload> questions = questionService.getCurated(conceptId, level, type);
        return ResponseEntity.ok(questions);
    }
}
