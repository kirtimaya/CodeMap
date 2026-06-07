package com.codemap.question;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

import java.util.List;

/**
 * Polymorphic question payload — serialized as JSON in the Question entity.
 * Jackson's @JsonTypeInfo writes a "type" discriminator field so we can
 * deserialize back to the correct subtype.
 */
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "type")
@JsonSubTypes({
        @JsonSubTypes.Type(value = QuestionPayload.McqPayload.class, name = "MCQ"),
        @JsonSubTypes.Type(value = QuestionPayload.CodingPayload.class, name = "CODING")
})
public sealed interface QuestionPayload permits QuestionPayload.McqPayload, QuestionPayload.CodingPayload {

    record McqPayload(
            String question,
            List<String> options,
            int correctIndex,
            String explanation
    ) implements QuestionPayload {}

    record CodingPayload(
            String prompt,
            String starterCode,
            String rubric,
            List<String> hints
            // exampleSolution intentionally omitted — not sent to the client
    ) implements QuestionPayload {}
}
