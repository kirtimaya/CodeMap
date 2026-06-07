package com.codemap.progress;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AttemptRequest(
        @NotBlank String sessionId,
        @NotBlank String conceptId,
        @NotNull @Min(1) @Max(5) Integer level,
        @NotNull Boolean correct,
        @NotBlank String questionType
) {}
