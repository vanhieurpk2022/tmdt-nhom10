package com.nhom10.tmdt.enums;


import lombok.Getter;

@Getter
public enum UserStatus {
    ACTIVE,      // Tài khoản đang hoạt động
    INACTIVE,    // Tạm ngưng sử dụng
    BANNED       // Bị khóa/cấm
}
