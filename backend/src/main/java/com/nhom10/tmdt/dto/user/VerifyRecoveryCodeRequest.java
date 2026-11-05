package com.nhom10.tmdt.dto.user;

import jakarta.validation.constraints.NotBlank;

public record VerifyRecoveryCodeRequest(
        @NotBlank(message = "Email không được để trống")
        String email,
        @NotBlank(message = "Mã xác thực không được để trống")
        String code
) {}
