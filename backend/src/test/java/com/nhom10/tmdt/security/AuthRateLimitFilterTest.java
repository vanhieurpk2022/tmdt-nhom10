package com.nhom10.tmdt.security;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import static org.junit.jupiter.api.Assertions.*;

class AuthRateLimitFilterTest {
    @Test void limitsRecoveryGuesses() throws Exception {
        var filter = new AuthRateLimitFilter();
        for (int i = 0; i < 21; i++) {
            var request = new MockHttpServletRequest("POST", "/auth/verify-recovery-code");
            var response = new MockHttpServletResponse();
            filter.doFilter(request, response, (req, res) -> {});
            assertEquals(i < 20 ? 200 : 429, response.getStatus());
        }
    }
    @Test void limitsRepeatedEmailRequests() throws Exception {
        var filter = new AuthRateLimitFilter();
        for (int i = 0; i < 4; i++) {
            var response = new MockHttpServletResponse();
            filter.doFilter(new MockHttpServletRequest("POST", "/auth/forgot-password"), response, (req, res) -> {});
            assertEquals(i < 3 ? 200 : 429, response.getStatus());
        }
    }
}
