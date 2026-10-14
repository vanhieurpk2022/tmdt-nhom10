package com.nhom10.tmdt.dto.user;

// DTO yêu cầu cập nhật thông tin hồ sơ cá nhân
public record UpdateProfileRequest(
        String fullname,
        String phone,
        String birthday,
        String gender,
        String preferredArea,
        String avatarUrl
) {}
