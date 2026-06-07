package com.codemap.question;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * Request body for POST /api/questions/generate.
 * Jakarta Validation constraints are checked by Spring MVC before the
 * method body runs — MethodArgumentNotValidException on failure.
 */
public record GenerateRequest(
        @NotBlank String conceptId,
        @NotBlank String conceptLabel,
        @NotBlank String conceptTagline,
        @NotNull @Min(1) @Max(5) Integer level,
        @NotNull QuestionType type
) {}
