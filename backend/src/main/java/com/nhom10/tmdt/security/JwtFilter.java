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

                    List<String> roles = user.getAuthorities().stream()
                            .map(grantedAuthority -> grantedAuthority.getAuthority())
                            .toList();

                    // Tạo chuỗi JWT mới (Thời gian hết hạn bên trong JwtService mặc định là +15 phút)
                    String newToken = jwtService.generateToken(user.getUsername(), "", "", true, roles);

                    // Tạo Cookie mới đè lên Cookie cũ trên trình duyệt
                    Cookie refreshCookie = new Cookie("accessToken", newToken);
                    refreshCookie.setHttpOnly(true);
                    refreshCookie.setPath("/");
                    refreshCookie.setSecure(false); // Để false ở localhost, true ở production

                    // Kiểm tra xem request này trước đó thuộc chế độ "Ghi nhớ" hay không
                    // (Nếu trước đó dùng Session Cookie - MaxAge = -1, thì duy trì -1. Nếu sống dài hạn thì cộng tiếp)
                    Cookie[] currentCookies = request.getCookies();
                    int maxAge = -1; // Mặc định là Session Cookie (xóa khi đóng trình duyệt)
                    if (currentCookies != null) {
                        for (Cookie c : currentCookies) {
                            // Nếu cookie cũ có thời gian sống dài hạn (> 15p), bạn có thể giữ nguyên hoặc cập nhật tùy ý
                            if ("accessToken".equals(c.getName()) && c.getMaxAge() > 15 * 60) {
                                maxAge = 30 * 24 * 60 * 60; // Giữ chế độ 30 ngày nếu là Remember Me
                            }
                        }
                    }

                    // Nếu là phiên bình thường không chọn Remember Me, cứ mỗi request ta đặt lại +15 phút (15 * 60 giây)
                    if (maxAge == -1) {
                        refreshCookie.setMaxAge(15 * 60);
                    } else {
                        refreshCookie.setMaxAge(maxAge);
                    }
                }
            }
        }catch (Exception e){
            SecurityContextHolder.clearContext();
        }
       }



        filterChain.doFilter(request, response);
    }
}
