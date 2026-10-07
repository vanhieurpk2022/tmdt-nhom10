package com.nhom10.tmdt.rest;

import com.cloudinary.Api;
import com.nhom10.tmdt.dto.ApiResponse;
import com.nhom10.tmdt.dto.user.CreateUserRequest;
import com.nhom10.tmdt.dto.user.LoginRequest;
import com.nhom10.tmdt.dto.user.LoginResponse;
import com.nhom10.tmdt.service.user.UserService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Arrays;

@RestController
@RequiredArgsConstructor
@RequestMapping("/auth")
public class UserController {

    private final UserService userService;

    @PostMapping("/logout")
    public ApiResponse<Void> logout(HttpServletResponse response) {

        Cookie cookie = new Cookie("accessToken", null);
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/");
        cookie.setMaxAge(0);

        response.addCookie(cookie);

        return new ApiResponse<>(200, "Đăng xuất thành công");
    }

    @GetMapping("/me")
    public ApiResponse<LoginResponse.UserResponse> getCurrentUser(Authentication authentication, HttpServletRequest request){
        Cookie[] cookies = request.getCookies();

        if (cookies == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }

        String token = Arrays.stream(cookies)
                .filter(cookie -> "accessToken".equals(cookie.getName()))
                .map(Cookie::getValue)
                .findFirst()
                .orElse(null);

        if (token == null || token.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }

        String email = authentication.getName();
        LoginResponse.UserResponse user = userService.getUserByEmail(email);
        return new ApiResponse<>(200, "Lấy thông tin người dùng thành công", user);
    }

    @GetMapping("/verify-email")
    public ApiResponse<Void> verify(@RequestParam String email,
                                    @RequestParam String code){
        userService.verifyEmail(email,code);
        return new ApiResponse<>(200,"Xác thực tài khoản thành công");
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<Void> createUser(@Valid @RequestBody CreateUserRequest request){
        userService.register(request);
        return new ApiResponse<>(HttpStatus.CREATED.value(),"Đăng kí thành công");
    }

    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(@Valid @RequestBody LoginRequest request, HttpServletResponse response){
       LoginResponse loginResponse =  userService.login(request);

       Cookie jwtCookie = new Cookie("accessToken",loginResponse.accessToken());
        jwtCookie.setHttpOnly(true);
        jwtCookie.setSecure(false); // Để 'false' khi test dưới localhost (Chuyển sang 'true' khi chạy HTTPS thực tế)
        jwtCookie.setPath("/");

        if (request.rememberMe()) {
            jwtCookie.setMaxAge((int) loginResponse.expiresIn()); // Sống 30 ngày theo JWT
        } else {
            jwtCookie.setMaxAge(-1); // Xóa khi đóng trình duyệt (Session Cookie)
        }
       response.addCookie(jwtCookie);

       return new ApiResponse<>(200,"Đăng nhập thành công",loginResponse);
    }
}
