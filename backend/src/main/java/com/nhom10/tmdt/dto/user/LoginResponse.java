package com.nhom10.tmdt.dto.user;

public record LoginResponse(
        String accessToken,
        String tokenType,
        long expiresIn,
        UserResponse user
) {
    public record UserResponse(
            Long id,
            String email,
            String fullName,
            String avatar
    ) {}
}