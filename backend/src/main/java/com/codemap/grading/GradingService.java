package com.codemap.grading;

import com.codemap.llm.GeminiClient;
import io.micrometer.core.annotation.Timed;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

/**
 * Grades user-submitted code by streaming a Gemini response via Server-Sent Events.
 *
 * Teaching note: This service bridges the imperative world (HTTP request) with
 * the reactive world (streaming response). GeminiClient.streamContent() returns
 * a Flux<String> from WebClient's SSE support — we pass it directly to the
 * GradingController, which Spring WebFlux writes as SSE to the HTTP response.
 *
 * No blocking I/O here: WebClient's reactor-netty driver handles the upstream
 * Gemini connection asynchronously on its own event loop, freeing Tomcat threads.
 *
 * @Timed instruments the method with a Micrometer Timer. Because grading is
 * expensive (full LLM round-trip), tracking duration is important for
 * understanding production performance.
 */
@Service
@RequiredArgsConstructor
public class GradingService {

    private final GeminiClient geminiClient;

    @Timed(value = "grading.stream", description = "Duration of a grading stream from first token to close")
    public Flux<String> gradeStream(GradeRequest req) {
        return geminiClient.streamContent(gradingSystemPrompt(), buildGradingPrompt(req));
    }

    private String gradingSystemPrompt() {
        return """
                You are a senior Java engineer grading a coding submission.
                Provide specific, constructive feedback. Be honest but encouraging.
                Structure your response clearly with sections for:
                1. Overall assessment (1-2 sentences)
                2. Correctness analysis
                3. Code quality observations
                4. Java idiom and best practice notes
                5. Specific suggestions for improvement
                """;
    }

    private String buildGradingPrompt(GradeRequest req) {
        return """
                Grade this Java solution for the concept "%s" (Level %d/5).

                PROBLEM:
                %s

                GRADING RUBRIC:
                %s

                USER'S SUBMISSION:
                ```java
                %s
                ```

                Provide detailed feedback. Be specific about what works well and what needs improvement.
                """.formatted(req.conceptLabel(), req.level(), req.prompt(), req.rubric(), req.userCode());
    }
}
