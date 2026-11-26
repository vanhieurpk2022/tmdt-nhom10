package com.nhom10.tmdt.security;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicBoolean;

/** Giới hạn thử đăng nhập/mã khôi phục và tránh gửi mail lặp liên tục. */
@Component
public class AuthRateLimitFilter extends OncePerRequestFilter {
    private record Window(long startedAt, int count) {}
    private final ConcurrentHashMap<String, Window> windows = new ConcurrentHashMap<>();
    private static final Set<String> EMAIL = Set.of("/auth/forgot-password", "/auth/resend", "/auth/register");
    private static final Set<String> ATTEMPTS = Set.of("/auth/login", "/auth/verify-recovery-code", "/auth/reset-password");

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain) throws ServletException, IOException {
        String path = request.getRequestURI();
        boolean email = EMAIL.contains(path);
        if (!"POST".equals(request.getMethod()) || !email && !ATTEMPTS.contains(path)) { chain.doFilter(request, response); return; }
        long now = System.currentTimeMillis();
        if (windows.size() > 5000) windows.entrySet().removeIf(entry -> now - entry.getValue().startedAt() >= 60000);
        String key = request.getRemoteAddr() + (email ? ":email" : ":attempt");
        AtomicBoolean allowed = new AtomicBoolean(false);
        if (windows.size() <= 5000 || windows.containsKey(key)) {
            windows.compute(key, (ignored, previous) -> {
                Window current = previous == null || now - previous.startedAt() >= 60000 ? new Window(now, 0) : previous;
                if (current.count() >= (email ? 3 : 20)) return current;
                allowed.set(true);
                return new Window(current.startedAt(), current.count() + 1);
            });
        }
        if (!allowed.get()) {
            response.setStatus(429); response.setCharacterEncoding("UTF-8"); response.setContentType("application/json");
            response.setHeader("Retry-After", "60");
            response.getWriter().write("{\"status\":429,\"message\":\"Bạn thử quá nhiều lần. Vui lòng chờ một phút rồi thử lại.\"}");
            return;
        }
        chain.doFilter(request, response);
    }
}
