package com.nhom10.tmdt.dto.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;

public record CreateUserRequest(
        @NotBlank(message = "Họ tên không được để trống")
        String fullname,

        @NotBlank @Email(message = "Email không hợp lệ")
        String email,

        @NotBlank(message = "Số điện thoại không được để trống")
        @Pattern(
                regexp = "^(0|\\+84)\\d{9}$",
                message = "Số điện thoại không hợp lệ"
        )
        String phone,

        @NotBlank @Size(min = 6, message = "Mật khẩu tối thiểu 6 ký tự")
        String password,

         String verifyPassword
) {

}
