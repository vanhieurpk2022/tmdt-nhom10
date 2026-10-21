package com.nhom10.tmdt.rest;

import com.nhom10.tmdt.dto.ApiResponse;
import com.nhom10.tmdt.dto.user.UpdateProfileRequest;
import com.nhom10.tmdt.dto.user.UserProfileResponse;
import com.nhom10.tmdt.service.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.nhom10.tmdt.dto.address.AddressRequest;
import com.nhom10.tmdt.dto.address.AddressResponse;
import com.nhom10.tmdt.service.address.AddressService;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/user")
public class AccountController {

    private final UserService userService;
    private final AddressService addressService;

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

    /**
     * GET /api/user/addresses
     * Lấy danh sách sổ địa chỉ của người dùng
     */
    @GetMapping("/addresses")
    public ApiResponse<List<AddressResponse>> getAddresses(Authentication authentication) {
        String email = authentication.getName();
        return new ApiResponse<>(200, "Lấy danh sách địa chỉ thành công", addressService.getUserAddresses(email));
    }

    /**
     * POST /api/user/addresses
     * Thêm địa chỉ mới
     */
    @PostMapping("/addresses")
    public ApiResponse<AddressResponse> addAddress(
            Authentication authentication,
            @RequestBody AddressRequest request
    ) {
        String email = authentication.getName();
        return new ApiResponse<>(200, "Thêm địa chỉ thành công", addressService.addAddress(email, request));
    }

    /**
     * PUT /api/user/addresses/{id}
     * Cập nhật địa chỉ theo ID
     */
    @PutMapping("/addresses/{id}")
    public ApiResponse<AddressResponse> updateAddress(
            Authentication authentication,
            @PathVariable Long id,
            @RequestBody AddressRequest request
    ) {
        String email = authentication.getName();
        return new ApiResponse<>(200, "Cập nhật địa chỉ thành công", addressService.updateAddress(email, id, request));
    }

    /**
     * DELETE /api/user/addresses/{id}
     * Xóa địa chỉ theo ID
     */
    @DeleteMapping("/addresses/{id}")
    public ApiResponse<Void> deleteAddress(
            Authentication authentication,
            @PathVariable Long id
    ) {
        String email = authentication.getName();
        addressService.deleteAddress(email, id);
        return new ApiResponse<>(200, "Xóa địa chỉ thành công", null);
    }

    /**
     * PUT /api/user/addresses/{id}/default
     * Đặt địa chỉ làm mặc định
     */
    @PutMapping("/addresses/{id}/default")
    public ApiResponse<Void> setDefaultAddress(
            Authentication authentication,
            @PathVariable Long id
    ) {
        String email = authentication.getName();
        addressService.setDefaultAddress(email, id);
        return new ApiResponse<>(200, "Đặt làm địa chỉ mặc định thành công", null);
    }

    /**
     * POST /api/user/change-password
     * Đổi mật khẩu tài khoản
     */
    @PostMapping("/change-password")
    public ApiResponse<Void> changePassword(
            Authentication authentication,
            @RequestBody com.nhom10.tmdt.dto.user.ChangePasswordRequest request
    ) {
        String email = authentication.getName();
        userService.changePassword(email, request);
        return new ApiResponse<>(200, "Đổi mật khẩu thành công", null);
    }
}
