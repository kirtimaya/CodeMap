package com.codemap.grading;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

/**
 * Streams LLM grading feedback as Server-Sent Events.
 *
 * Teaching note: Returning Flux<String> with MediaType.TEXT_EVENT_STREAM_VALUE
 * is how Spring WebFlux handles SSE. The DispatcherServlet detects the reactive
 * return type and switches to non-blocking response writing. The client receives
 * each text token as a separate SSE "data:" line.
 *
 * The frontend uses EventSource (or fetch with streaming) to consume these events
 * and renders them word-by-word in the grading result area.
 *
 * This endpoint works because spring-boot-starter-webflux is on the classpath
 * alongside spring-boot-starter-web. Spring Boot auto-configuration detects
 * both and uses the WebMVC reactive adapters for Flux return types.
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class GradingController {

    private final GradingService gradingService;

    /**
     * POST /api/grade
     * Streams the grading result as SSE text events.
     * Each event is a text token from Claude.
     */
    @PostMapping(value = "/grade", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> grade(@Valid @RequestBody GradeRequest request) {
        return gradingService.gradeStream(request);
    }
}
