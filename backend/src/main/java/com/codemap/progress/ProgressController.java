package com.codemap.progress;

import io.micrometer.core.annotation.Timed;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Records quiz attempts for future cross-device progress sync.
 * In v1, the frontend stores progress in localStorage and optionally
 * posts attempts here for backend aggregation.
 */
@RestController
@RequestMapping("/api/progress")
@RequiredArgsConstructor
public class ProgressController {

    private final AttemptRecordRepository attemptRepository;

    /**
     * POST /api/progress
     * Records a single quiz attempt.
     */
    @PostMapping
    @Timed(value = "progress.record", description = "Time to persist an attempt record")
    public ResponseEntity<Void> recordAttempt(@Valid @RequestBody AttemptRequest req) {
        AttemptRecord record = AttemptRecord.builder()
                .sessionId(req.sessionId())
                .conceptId(req.conceptId())
                .level(req.level())
                .correct(req.correct())
                .questionType(req.questionType())
                .build();
        attemptRepository.save(record);
        return ResponseEntity.noContent().build();
    }
}
