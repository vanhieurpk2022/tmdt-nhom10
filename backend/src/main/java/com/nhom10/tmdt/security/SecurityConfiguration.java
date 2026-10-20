package com.nhom10.tmdt.security;

import lombok.RequiredArgsConstructor;
import com.nhom10.tmdt.config.VnPayProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;

import java.util.Arrays;

@Configuration
public class SecurityConfiguration {
    private final JwtFilter jwtFilter;
    private final VnPayProperties vnPayProperties;

    public SecurityConfiguration(JwtFilter jwtFilter, VnPayProperties vnPayProperties) {
        this.jwtFilter = jwtFilter;
        this.vnPayProperties = vnPayProperties;
    }

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // spring boot security 7
    @Bean
    public DaoAuthenticationProvider authenticationProvider(UserSecutiryService userSecurityService) {
        DaoAuthenticationProvider dap = new DaoAuthenticationProvider(userSecurityService);
        dap.setPasswordEncoder(passwordEncoder());
        return dap;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        // Cấu hình phân quyền cho endpoint
        http.authorizeHttpRequests(auth -> auth
                .requestMatchers("/error").permitAll()
                .requestMatchers(HttpMethod.GET, "/payments/vnpay/ipn", "/payments/vnpay/return").permitAll()
                .requestMatchers("/auth/**").permitAll()
                .requestMatchers("/v1/product/**").permitAll()
                .requestMatchers("/manager/**").permitAll()
                .requestMatchers("/v1/category/**").permitAll() // có xài
                .requestMatchers("/v1/product-image/**").permitAll() // có xài
                .requestMatchers("/uploads/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/products/**").permitAll()
                .requestMatchers( "/factories/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/custom-scent/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/custom-scent/**").permitAll()
                .requestMatchers("/shipping/provinces", "/shipping/districts", "/shipping/wards").permitAll()
                .requestMatchers("/admin/**").permitAll()
                .anyRequest().authenticated());
        http.sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((req, res, e) -> {
                            res.setStatus(401);
                            res.setContentType("application/json;charset=UTF-8");
                            res.getWriter().write("{\"code\":401,\"message\":\"Chưa đăng nhập hoặc token hết hạn\"}");
                        })
                        .accessDeniedHandler((req, res, e) -> {
                            res.setStatus(403);
                            res.setContentType("application/json;charset=UTF-8");
                            res.getWriter().write("{\"code\":403,\"message\":\"Không đủ quyền truy cập\"}");
                        }))

                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);


        // Cấu hình cors
        http.cors(cors -> {
            cors.configurationSource(request -> {
                CorsConfiguration corsConfig = new CorsConfiguration();

                var allowedOrigins = new java.util.ArrayList<>(Endpoints.FRONTEND_HOSTS);
                var resultUrl = vnPayProperties.getFrontendResultUrl();
                if (resultUrl != null && resultUrl.getHost() != null) {
                    allowedOrigins.add(resultUrl.getScheme() + "://" + resultUrl.getRawAuthority());
                }
                corsConfig.setAllowedOrigins(allowedOrigins);

                corsConfig.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS","PATCH"));
                corsConfig.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With", "Accept", "Idempotency-Key"));
                corsConfig.setAllowCredentials(true); // Giữ nguyên để cho phép truyền nhận HttpOnly Cookie

                return corsConfig;
            });
        });

        http.csrf(AbstractHttpConfigurer::disable);

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
