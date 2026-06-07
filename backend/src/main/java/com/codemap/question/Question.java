package com.codemap.question;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * JPA entity for a generated or curated question.
 *
 * Teaching note: @Entity maps this class to the "questions" table.
 * @GeneratedValue(SEQUENCE) uses a database sequence — more efficient
 * than IDENTITY for batch inserts. The 'source' column distinguishes
 * LLM-generated questions from hand-curated ones.
 */
@Entity
@Table(name = "questions", indexes = {
        @Index(name = "idx_questions_concept_level_type", columnList = "concept_id, level, type")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "question_seq")
    @SequenceGenerator(name = "question_seq", sequenceName = "question_seq", allocationSize = 50)
    private Long id;

    @Column(name = "concept_id", nullable = false)
    private String conceptId;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private QuestionType type;

    @Column(nullable = false)
    private int level;

    /**
     * The full question payload as JSON — avoids a complex relational
     * schema for polymorphic MCQ vs coding question structures.
     * In a larger system, separate tables would be appropriate.
     */
    @Column(columnDefinition = "TEXT", nullable = false)
    private String payloadJson;

    /** "generated" (LLM) or "curated" (hand-written) */
    @Column(nullable = false)
    private String source;

    @Column(nullable = false)
    private Instant createdAt;

    @PrePersist
    void prePersist() {
        if (createdAt == null) createdAt = Instant.now();
    }
}
