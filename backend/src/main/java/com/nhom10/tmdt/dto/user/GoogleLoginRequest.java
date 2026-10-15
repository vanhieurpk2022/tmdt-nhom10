package com.nhom10.tmdt.dto.user;

public record GoogleLoginRequest(
        String credential,  
        boolean rememberMe
) {}
