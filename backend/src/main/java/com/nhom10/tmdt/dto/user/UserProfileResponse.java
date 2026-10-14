package com.nhom10.tmdt.dto.user;

// DTO phản hồi thông tin hồ sơ cá nhân người dùng
public record UserProfileResponse(
        Long id,
        String fullname,
        String email,
        String phone,
        String birthday,
        String gender,
        String preferredArea,
        String avatarUrl,
        boolean isVerify
) {}
