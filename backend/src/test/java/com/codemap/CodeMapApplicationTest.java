package com.codemap;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

/**
 * Smoke test — verifies the Spring context loads successfully with H2.
 * Uses demo API key so no real Anthropic calls are made.
 */
@SpringBootTest
@TestPropertySource(properties = {
        "gemini.api-key=test-key-not-real",
        "spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1;MODE=PostgreSQL",
        "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect"
})
class CodeMapApplicationTest {

    @Test
    void contextLoads() {
        // Verifies auto-configuration, bean wiring, and JPA schema creation succeed
    }
}
