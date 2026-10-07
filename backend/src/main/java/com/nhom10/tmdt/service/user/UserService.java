package com.nhom10.tmdt.service.user;

import com.nhom10.tmdt.dto.user.CreateUserRequest;
import com.nhom10.tmdt.dto.user.LoginRequest;
import com.nhom10.tmdt.dto.user.LoginResponse;

public interface UserService {
     void register(CreateUserRequest request);
     LoginResponse login(LoginRequest request);
     void verifyEmail(String email, String code);
}
