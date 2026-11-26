package com.nhom10.tmdt.security;

import com.nhom10.tmdt.config.JwtService;
import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.Test;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;

class JwtLifetimeTest {
    @Test void passwordChangeInvalidatesExistingToken() {
        var service = new JwtService("x".repeat(64), 1800000);
        var token = service.generateToken("user@example.com", "", "User", true, List.of("USER"), true, "old-password-hash");
        var oldUser = org.springframework.security.core.userdetails.User.withUsername("user@example.com").password("old-password-hash").authorities("ROLE_USER").build();
        var updatedUser = org.springframework.security.core.userdetails.User.withUsername("user@example.com").password("new-password-hash").authorities("ROLE_USER").build();
        assertTrue(service.validateToken(token, oldUser));
        assertFalse(service.validateToken(token, updatedUser));
    }
    @Test void tokenLifetimeMatchesReportedCookieLifetime() {
        var service = new JwtService("x".repeat(64), 1800000);
        for (boolean remember : List.of(false, true)) {
            var token = service.generateToken("user@example.com", "", "User", true, List.of("USER"), remember);
            long actual = service.extractClaim(token, Claims::getExpiration).getTime() - System.currentTimeMillis();
            assertTrue(Math.abs(actual - service.getExpirationSeconds(remember) * 1000) < 2000);
        }
    }
}
