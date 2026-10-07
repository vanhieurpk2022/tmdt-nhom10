package com.nhom10.tmdt.dto.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank @Email(message = "Email không hợp lệ") String email,
        @NotBlank String password
) {
}
