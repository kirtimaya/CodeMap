package com.codemap.llm;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Flux;

import java.util.List;
import java.util.Map;

/**
 * Thin wrapper around the Gemini REST API using Spring WebClient.
 *
 * Teaching note: This class shows two patterns for consuming an LLM API:
 *
 * 1. Synchronous (generateContent): used for question generation, where we need
 *    the complete response before returning to the caller. Uses block() safely
 *    because it is only called from Spring MVC controller threads (Tomcat),
 *    never from a reactive event-loop thread.
 *
 * 2. Reactive streaming (streamContent): used for grading, where we want to
 *    forward text tokens to the HTTP client as they arrive. The SSE endpoint
 *    (alt=sse) sends each chunk as a "data:" event; WebClient parses these
 *    into ServerSentEvent<String> and we extract the text delta from each.
 */
@Component
@Slf4j
public class GeminiClient {

    private static final String BASE_URL = "https://generativelanguage.googleapis.com/v1beta";

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    @Value("${gemini.api-key}")
    private String apiKey;

    @Value("${gemini.model:gemini-2.5-flash}")
    private String model;

    @Value("${gemini.max-tokens:2048}")
    private int maxTokens;

    public GeminiClient(WebClient.Builder builder, ObjectMapper objectMapper) {
        this.webClient = builder.baseUrl(BASE_URL).build();
        this.objectMapper = objectMapper;
    }

    /**
     * Blocking call — returns the full generated text.
     * Safe to call from Spring MVC threads; do NOT call from a reactive subscriber.
     */
    public String generateContent(String systemPrompt, String userPrompt) {
        JsonNode response = webClient.post()
                .uri("/models/{model}:generateContent?key={key}", model, apiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(buildBody(systemPrompt, userPrompt))
                .retrieve()
                .bodyToMono(JsonNode.class)
                .onErrorMap(WebClientResponseException.class,
                        ex -> new LlmException("Gemini API error " + ex.getStatusCode() + ": " + ex.getResponseBodyAsString()))
                .block();

        return extractText(response);
    }

    /**
     * Reactive streaming — emits text tokens as they arrive from the Gemini SSE endpoint.
     * Each SSE "data:" field is a JSON object; we extract candidates[0].content.parts[0].text.
     */
    public Flux<String> streamContent(String systemPrompt, String userPrompt) {
        return webClient.post()
                .uri("/models/{model}:streamGenerateContent?alt=sse&key={key}", model, apiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.TEXT_EVENT_STREAM)
                .bodyValue(buildBody(systemPrompt, userPrompt))
                .retrieve()
                .bodyToFlux(new ParameterizedTypeReference<ServerSentEvent<String>>() {})
                .onErrorMap(WebClientResponseException.class,
                        ex -> new LlmException("Gemini streaming error " + ex.getStatusCode()))
                .mapNotNull(ServerSentEvent::data)
                .flatMap(json -> {
                    try {
                        String text = extractText(objectMapper.readTree(json));
                        return text.isBlank() ? Flux.empty() : Flux.just(text);
                    } catch (Exception e) {
                        log.warn("Failed to parse Gemini SSE chunk: {}", e.getMessage());
                        return Flux.empty();
                    }
                });
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private Map<String, Object> buildBody(String systemPrompt, String userPrompt) {
        return Map.of(
                "contents", List.of(
                        Map.of("role", "user",
                               "parts", List.of(Map.of("text", userPrompt)))
                ),
                "systemInstruction", Map.of(
                        "parts", List.of(Map.of("text", systemPrompt))
                ),
                "generationConfig", Map.of(
                        "maxOutputTokens", maxTokens
                )
        );
    }

    private String extractText(JsonNode node) {
        if (node == null) throw new LlmException("Gemini returned null response");
        JsonNode text = node.path("candidates").path(0)
                           .path("content").path("parts").path(0)
                           .path("text");
        if (text.isMissingNode()) throw new LlmException("Gemini response missing text: " + node);
        return text.asText();
    }
}
