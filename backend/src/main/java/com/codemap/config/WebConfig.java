package com.codemap.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Global CORS configuration — allows the Vite frontend to call this backend
 * during development. In production, serve frontend and backend on the same
 * origin (or configure a proper allowed-origins list).
 *
 * Teaching note: WebMvcConfigurer is a callback-based Spring MVC extension
 * point. Spring auto-configuration backs off when it detects a custom
 * WebMvcConfigurer that defines CORS mappings.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${codemap.cors.allowed-origins:http://localhost:5173}")
    private String[] allowedOrigins;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(allowedOrigins)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(false)
                .maxAge(3600);
    }
}
