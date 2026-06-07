package com.codemap;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * CodeMap backend — intentionally built with Spring Boot so the app itself
 * demonstrates the concepts it teaches: auto-configuration, bean lifecycle,
 * AOP (@Timed metrics), WebFlux SSE, and Spring Data JPA.
 */
@SpringBootApplication
@EnableAsync
public class CodeMapApplication {

    public static void main(String[] args) {
        SpringApplication.run(CodeMapApplication.class, args);
    }
}
