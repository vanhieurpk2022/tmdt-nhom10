package com.nhom10.tmdt.dto.user;

public record FacebookLoginRequest(
        String accessToken,
        boolean rememberMe
) {}
