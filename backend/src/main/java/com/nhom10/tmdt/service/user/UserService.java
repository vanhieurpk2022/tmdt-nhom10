package com.nhom10.tmdt.service.user;

import com.nhom10.tmdt.dto.user.CreateUserRequest;
import com.nhom10.tmdt.dto.user.LoginRequest;
import com.nhom10.tmdt.dto.user.LoginResponse;
import com.nhom10.tmdt.model.User;

public interface UserService {
     LoginResponse.UserResponse getUserByEmail(String email);
     void register(CreateUserRequest request);
     LoginResponse login(LoginRequest request);
     void verifyEmail(String email, String code);
     void resendCode(String email);
}
