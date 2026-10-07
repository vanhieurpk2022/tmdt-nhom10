package com.nhom10.tmdt.rest;

import com.nhom10.tmdt.dto.ApiResponse;
import com.nhom10.tmdt.dto.user.CreateUserRequest;
import com.nhom10.tmdt.dto.user.LoginRequest;
import com.nhom10.tmdt.dto.user.LoginResponse;
import com.nhom10.tmdt.service.user.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/auth")
public class UserController {

    private final UserService userService;

    @GetMapping("/verify-email")
    public ApiResponse<Void> verify(@RequestParam String email,
                                    @RequestParam String code){
        userService.verifyEmail(email,code);
        return new ApiResponse<>(200,"Xác thực tài khoản thành công");
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<Void> createUser(@Valid @RequestBody CreateUserRequest request){
        userService.register(request);
        return new ApiResponse<>(HttpStatus.CREATED.value(),"Đăng kí thành công");
    }

    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(@Valid @RequestBody LoginRequest request){
       LoginResponse loginResponse =  userService.login(request);
       return new ApiResponse<>(200,"Đăng nhập thành công",loginResponse);
    }
}
