package com.codemap.question;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA repository for Question.
 *
 * Teaching note: Spring Data generates the implementation at startup by
 * parsing these method names. findByConceptIdAndLevelAndType generates:
 *   SELECT * FROM questions WHERE concept_id=? AND level=? AND type=?
 *
 * No implementation class to write — this is the Repository pattern
 * fully realized by the framework.
 */
@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {

    List<Question> findByConceptIdAndLevelAndType(String conceptId, int level, QuestionType type);

    Optional<Question> findFirstByConceptIdAndLevelAndType(String conceptId, int level, QuestionType type);

    List<Question> findByConceptIdAndType(String conceptId, QuestionType type);

    boolean existsByConceptIdAndLevelAndTypeAndSource(
            String conceptId, int level, QuestionType type, String source);
}
