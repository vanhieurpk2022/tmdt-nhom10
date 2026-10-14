package com.nhom10.tmdt.rest;

import com.nhom10.tmdt.dto.ApiResponse;
import com.nhom10.tmdt.dto.user.UpdateProfileRequest;
import com.nhom10.tmdt.dto.user.UserProfileResponse;
import com.nhom10.tmdt.service.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/user")
public class AccountController {

    private final UserService userService;

    /**
     * GET /api/user/profile
     * Lấy thông tin hồ sơ cá nhân của người dùng đang đăng nhập
     */
    @GetMapping("/profile")
    public ApiResponse<UserProfileResponse> getProfile(Authentication authentication) {
        String email = authentication.getName();
        return new ApiResponse<>(200, "Lấy thông tin hồ sơ thành công", userService.getProfile(email));
    }

    /**
     * PUT /api/user/profile
     * Cập nhật thông tin hồ sơ cá nhân
     */
    @PutMapping("/profile")
    public ApiResponse<UserProfileResponse> updateProfile(
            Authentication authentication,
            @RequestBody UpdateProfileRequest request
    ) {
        String email = authentication.getName();
        return new ApiResponse<>(200, "Cập nhật hồ sơ thành công", userService.updateProfile(email, request));
    }
}
