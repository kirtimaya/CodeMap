package com.codemap.progress;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AttemptRecordRepository extends JpaRepository<AttemptRecord, Long> {
    List<AttemptRecord> findBySessionIdAndConceptId(String sessionId, String conceptId);
    List<AttemptRecord> findBySessionId(String sessionId);
}
