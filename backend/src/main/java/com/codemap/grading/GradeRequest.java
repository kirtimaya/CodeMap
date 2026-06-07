package com.codemap.grading;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record GradeRequest(
        @NotBlank String conceptId,
        @NotBlank String conceptLabel,
        @NotNull @Min(1) @Max(5) Integer level,
        @NotBlank String userCode,
        @NotBlank String prompt,
        @NotBlank String rubric
) {}
