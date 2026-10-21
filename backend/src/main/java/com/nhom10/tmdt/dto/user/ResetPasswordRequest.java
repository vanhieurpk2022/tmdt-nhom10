package com.nhom10.tmdt.dto.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ResetPasswordRequest(
        @NotBlank(message = "Email không được để trống")
        String email,
        @NotBlank(message = "Mã xác thực không được để trống")
        String code,
        @NotBlank(message = "Mật khẩu mới không được để trống")
        @Size(min = 6, message = "Mật khẩu phải có ít nhất 6 ký tự")
        String newPassword,
        @NotBlank(message = "Xác nhận mật khẩu không được để trống")
        String confirmPassword
) {}
