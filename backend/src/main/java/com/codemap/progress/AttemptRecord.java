package com.codemap.progress;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * Persists a single quiz attempt for cross-device sync (future auth feature).
 * In v1, progress is stored client-side in localStorage; this entity is for
 * future backend sync when authentication is added.
 */
@Entity
@Table(name = "attempt_records", indexes = {
        @Index(name = "idx_attempts_session_concept", columnList = "session_id, concept_id")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttemptRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "attempt_seq")
    @SequenceGenerator(name = "attempt_seq", sequenceName = "attempt_seq", allocationSize = 100)
    private Long id;

    /** Anonymous session ID (UUID from localStorage, no auth required) */
    @Column(name = "session_id", nullable = false)
    private String sessionId;

    @Column(name = "concept_id", nullable = false)
    private String conceptId;

    @Column(nullable = false)
    private int level;

    @Column(nullable = false)
    private boolean correct;

    @Column(name = "question_type", nullable = false)
    private String questionType;

    @Column(nullable = false)
    private Instant attemptedAt;

    @PrePersist
    void prePersist() {
        if (attemptedAt == null) attemptedAt = Instant.now();
    }
}
