package com.nhom10.tmdt.service.user;

import com.nhom10.tmdt.config.AppException;
import com.nhom10.tmdt.config.JwtService;
import com.nhom10.tmdt.dto.user.CreateUserRequest;
import com.nhom10.tmdt.dto.user.LoginRequest;
import com.nhom10.tmdt.dto.user.LoginResponse;
import com.nhom10.tmdt.enums.ErrorCode;
import com.nhom10.tmdt.enums.RoleName;
import com.nhom10.tmdt.model.Role;
import com.nhom10.tmdt.model.User;
import com.nhom10.tmdt.repo.RoleRepository;
import com.nhom10.tmdt.repo.UserRepository;
import com.nhom10.tmdt.service.imp.EmailSevice;
import lombok.RequiredArgsConstructor;
import org.springframework.cglib.core.Local;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@RequiredArgsConstructor
@Service
public class UserServiceImp implements UserService {

    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;
    private final RoleRepository roleRepository;
    private final EmailSevice emailSevice;

    @Override
    public LoginResponse.UserResponse getUserByEmail(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(()->  new AppException(ErrorCode.NOT_FOUND));
        List<String> roles = user.getRoles().stream().map(Role::getName).toList();

        return  new LoginResponse.UserResponse(user.getId(),user.getEmail(),user.getFullname(),user.getAvatarUrl(),roles);
    }

    // đang lấy username -> email
    @Override
    public void register(CreateUserRequest request) {

        String email = request.email().trim().toLowerCase();

        if(userRepository.existsUserByEmail(email)) {
           throw new AppException(ErrorCode.EMAIL_EXISTED);
       }
        if(!request.password().equals(request.verifyPassword()) ){
            throw new AppException(ErrorCode.NOT_MATCH_PASSWORD);
        }

        String getCode = emailSevice.generateToken();
       Role userRole = roleRepository.findByName(RoleName.USER.name()).orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));
        emailSevice.sendActiveAccount(email,getCode);

        userRepository.save(User.builder()
               .fullname(request.fullname())
               .phone(request.phone())
               .password(bCryptPasswordEncoder.encode(request.password()))
               .email(email)
               .codeActive(getCode)
                .verifyCodeExpiresAt(LocalDateTime.now().plusMinutes(5))
               .roles(new HashSet<>(Set.of(userRole))).build());

    }

    @Override
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() ->new AppException(ErrorCode.INVALID_CREDENTIALS));

        if(!user.isVerify()){
            if(user.getVerifyCodeExpiresAt().isBefore(LocalDateTime.now())){
                // họ quên xác thực cần gửi mail lại
                String getCode = emailSevice.generateToken();
                emailSevice.sendActiveAccount(user.getEmail(),getCode);

                user.setVerifyCodeExpiresAt(LocalDateTime.now().plusMinutes(5));
                user.setCodeActive(getCode);
                userRepository.save(user);
            }
            throw new AppException(ErrorCode.VERIFY_EMAIL);
        }
        if(!bCryptPasswordEncoder.matches(request.password(),user.getPassword())){
            throw new AppException(ErrorCode.INVALID_CREDENTIALS);
        }

        List<String> roles = user.getRoles().stream().map(Role::getName).toList();

        String accessToken = jwtService.generateToken(user.getEmail(),"", user.getFullname(),user.isVerify(),roles);
        long expiresIn = jwtService.getExpirationSeconds(request.rememberMe());
        LoginResponse.UserResponse userDto = new LoginResponse.UserResponse(
                user.getId(),
                user.getEmail(),
                user.getFullname(),
                user.getAvatarUrl(),roles);

        return new LoginResponse(accessToken, "Bearer", expiresIn, userDto);
    }

    @Override
    public void verifyEmail(String email, String code) {
        if(email.isEmpty() || code.isEmpty()){
            throw new AppException(ErrorCode.NOT_FOUND);
        }

        User user = userRepository.findByEmail(email).orElseThrow(()-> new AppException(ErrorCode.NOT_FOUND));
        if(user.isVerify()){
            throw new AppException(ErrorCode.VERIFY);
        }
        if(user.getVerifyCodeExpiresAt().isBefore(LocalDateTime.now())){
            throw new AppException(ErrorCode.VERIFY_CODE_EXPIRED);
        }
        if(!user.getCodeActive().equals(code)){
            throw new AppException(ErrorCode.VERIFY_CODE_FAIL);
        }
        user.setVerify(true);
        user.setCodeActive(null);
        user.setVerifyCodeExpiresAt(null);
        userRepository.save(user);
    }

    @Override
    public void resendCode(String email) {
        if(email.isEmpty() ){
            throw new AppException(ErrorCode.NOT_FOUND);
        }
        User user = userRepository.findByEmail(email).orElseThrow(()-> new AppException(ErrorCode.NOT_FOUND));
        if(!user.isVerify()){
            String getCode = emailSevice.generateToken();
            user.setCodeActive(getCode);
            user.setVerifyCodeExpiresAt(LocalDateTime.now().plusMinutes(5));
            emailSevice.sendActiveAccount(email,getCode);
            userRepository.save(user);
        }else{
            throw new AppException(ErrorCode.VERIFY);
        }

    }


}
