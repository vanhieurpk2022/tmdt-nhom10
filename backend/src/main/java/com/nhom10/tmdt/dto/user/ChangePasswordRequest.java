package com.nhom10.tmdt.dto.user;

// DTO tiếp nhận yêu cầu đổi mật khẩu của người dùng
public record ChangePasswordRequest(
        String currentPassword,
        String newPassword,
        String confirmPassword
) {
}
