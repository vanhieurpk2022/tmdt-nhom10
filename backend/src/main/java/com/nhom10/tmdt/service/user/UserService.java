package com.nhom10.tmdt.service.user;

import com.nhom10.tmdt.dto.user.ChangePasswordRequest;
import com.nhom10.tmdt.dto.user.CreateUserRequest;
import com.nhom10.tmdt.dto.user.FacebookLoginRequest;
import com.nhom10.tmdt.dto.user.GoogleLoginRequest;
import com.nhom10.tmdt.dto.user.LoginRequest;
import com.nhom10.tmdt.dto.user.LoginResponse;
import com.nhom10.tmdt.dto.user.UpdateProfileRequest;
import com.nhom10.tmdt.dto.user.UserProfileResponse;
import com.nhom10.tmdt.model.User;

public interface UserService {
     LoginResponse.UserResponse getUserByEmail(String email);
     void register(CreateUserRequest request);
     LoginResponse login(LoginRequest request);
     LoginResponse loginWithGoogle(GoogleLoginRequest request);
     LoginResponse loginWithFacebook(FacebookLoginRequest request);
     void verifyEmail(String email, String code);
     void resendCode(String email);

     // Lấy thông tin hồ sơ cá nhân
     UserProfileResponse getProfile(String email);

     // Cập nhật thông tin hồ sơ cá nhân
     UserProfileResponse updateProfile(String email, UpdateProfileRequest request);

     // Đổi mật khẩu tài khoản
     void changePassword(String email, ChangePasswordRequest request);
}
