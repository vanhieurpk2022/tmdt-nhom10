package com.nhom10.tmdt.security;

import com.nhom10.tmdt.config.JwtService;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
       Cookie[] cookies = request.getCookies();
       String token = null;

       if(cookies != null){
           for(Cookie cookie : cookies){
               if("accessToken".equals(cookie.getName())){
                   token = cookie.getValue();
                   break;
               }
           }
       }
       if(token !=null){
        try {
            String email = jwtService.extractUsername(token);
            if(email !=null && SecurityContextHolder.getContext().getAuthentication() == null){
                UserDetails user =userDetailsService.loadUserByUsername(email);
                if(user.isEnabled() && user.isAccountNonLocked() && jwtService.validateToken(token,user)){
                    var authToken = new UsernamePasswordAuthenticationToken(user,null, user.getAuthorities());
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        }catch (Exception e){
            SecurityContextHolder.clearContext();
        }
       }



        filterChain.doFilter(request, response);
    }
}
