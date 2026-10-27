package com.nhom10.tmdt.security;

import com.nhom10.tmdt.config.VnPayProperties;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.net.URI;

/** Cookie-authenticated payment writes must come from a browser allowed by CORS. */
@Component
public class PaymentRequestFilter extends OncePerRequestFilter {
    private final VnPayProperties properties;
    public PaymentRequestFilter(VnPayProperties properties) { this.properties = properties; }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String path = request.getServletPath();
        if ("POST".equals(request.getMethod()) && (path.equals("/orders")
                || (path.startsWith("/orders/") && path.endsWith("/cancel"))
                || path.startsWith("/payments/vnpay/") || path.startsWith("/admin/payments/"))) {
            String origin = request.getHeader("Origin");
            URI result = properties.getFrontendResultUrl();
            String configuredOrigin = result.getScheme() + "://" + result.getRawAuthority();
            if (!"XMLHttpRequest".equals(request.getHeader("X-Requested-With"))
                    || (origin != null && !Endpoints.FRONTEND_HOSTS.contains(origin) && !origin.equals(configuredOrigin))) {
                response.setStatus(403);
                response.setContentType("application/json;charset=UTF-8");
                response.getWriter().write("{\"code\":403,\"message\":\"Yêu cầu thanh toán không hợp lệ\"}");
                return;
            }
        }
        chain.doFilter(request, response);
    }
}
