package com.nhom10.tmdt.rest;

import com.cloudinary.Api;
import com.nhom10.tmdt.dto.ApiResponse;
import com.nhom10.tmdt.dto.user.CreateUserRequest;
import com.nhom10.tmdt.dto.user.FacebookLoginRequest;
import com.nhom10.tmdt.dto.user.ForgotPasswordRequest;
import com.nhom10.tmdt.dto.user.GoogleLoginRequest;
import com.nhom10.tmdt.dto.user.ResetPasswordRequest;
import com.nhom10.tmdt.dto.user.VerifyRecoveryCodeRequest;
import com.nhom10.tmdt.dto.user.LoginRequest;
import com.nhom10.tmdt.dto.user.LoginResponse;
import com.nhom10.tmdt.dto.verify.ResendRequest;
import com.nhom10.tmdt.dto.verify.VerifyRequest;
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
    @PostMapping("/resend")
    public ApiResponse<Void> resend(@RequestBody ResendRequest request) {
        userService.resendCode(request.email());
        return new ApiResponse<>(200, "Đăng xuất thành công");
    }
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

    // {email}/{code} này là PathVariable
    @GetMapping("/verify-email")
    public ApiResponse<Void> verify(@RequestParam String email,@RequestParam String code){
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

    @PostMapping("/google")
    public ApiResponse<LoginResponse> loginWithGoogle(
            @RequestBody GoogleLoginRequest request,
            HttpServletResponse response) {

        LoginResponse loginResponse = userService.loginWithGoogle(request);

        Cookie jwtCookie = new Cookie("accessToken", loginResponse.accessToken());
        jwtCookie.setHttpOnly(true);
        jwtCookie.setSecure(false);
        jwtCookie.setPath("/");
        if (request.rememberMe()) {
            jwtCookie.setMaxAge((int) loginResponse.expiresIn());
        } else {
            jwtCookie.setMaxAge(-1);
        }
        response.addCookie(jwtCookie);

        return new ApiResponse<>(200, "Đăng nhập bằng Google thành công", loginResponse);
    }

    @PostMapping("/facebook")
    public ApiResponse<LoginResponse> loginWithFacebook(
            @RequestBody FacebookLoginRequest request,
            HttpServletResponse response) {

        LoginResponse loginResponse = userService.loginWithFacebook(request);

        Cookie jwtCookie = new Cookie("accessToken", loginResponse.accessToken());
        jwtCookie.setHttpOnly(true);
        jwtCookie.setSecure(false);
        jwtCookie.setPath("/");
        if (request.rememberMe()) {
            jwtCookie.setMaxAge((int) loginResponse.expiresIn());
        } else {
            jwtCookie.setMaxAge(-1);
        }
        response.addCookie(jwtCookie);

        return new ApiResponse<>(200, "Đăng nhập bằng Facebook thành công", loginResponse);
    }

    @PostMapping("/forgot-password")
    public ApiResponse<Void> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        userService.forgotPassword(request.email());
        return new ApiResponse<>(200, "Mã khôi phục mật khẩu đã được gửi đến email của bạn");
    }

    @PostMapping("/verify-recovery-code")
    public ApiResponse<Void> verifyRecoveryCode(@Valid @RequestBody VerifyRecoveryCodeRequest request) {
        userService.verifyRecoveryCode(request.email(), request.code());
        return new ApiResponse<>(200, "Xác thực mã khôi phục thành công");
    }

    @PostMapping("/reset-password")
    public ApiResponse<Void> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        userService.resetPassword(request);
        return new ApiResponse<>(200, "Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại");
    }
}
