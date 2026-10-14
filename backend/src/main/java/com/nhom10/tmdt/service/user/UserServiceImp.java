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
        System.out.println(email);
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

    // Lấy thông tin hồ sơ cá nhân của người dùng theo email
    @Override
    public com.nhom10.tmdt.dto.user.UserProfileResponse getProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));

        return new com.nhom10.tmdt.dto.user.UserProfileResponse(
                user.getId(),
                user.getFullname(),
                user.getEmail(),
                user.getPhone(),
                user.getBirthday(),
                user.getGender(),
                user.getPreferredArea(),
                user.getAvatarUrl(),
                user.isVerify()
        );
    }

    // Cập nhật thông tin hồ sơ cá nhân
    @Override
    public com.nhom10.tmdt.dto.user.UserProfileResponse updateProfile(String email, com.nhom10.tmdt.dto.user.UpdateProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));

        if (request.fullname() != null && !request.fullname().isBlank()) {
            user.setFullname(request.fullname().trim());
        }
        if (request.phone() != null) {
            user.setPhone(request.phone().trim());
        }
        if (request.birthday() != null) {
            user.setBirthday(request.birthday().trim());
        }
        if (request.gender() != null) {
            user.setGender(request.gender().trim());
        }
        if (request.preferredArea() != null) {
            user.setPreferredArea(request.preferredArea().trim());
        }
        if (request.avatarUrl() != null && !request.avatarUrl().isBlank()) {
            user.setAvatarUrl(request.avatarUrl().trim());
        }

        User saved = userRepository.save(user);

        return new com.nhom10.tmdt.dto.user.UserProfileResponse(
                saved.getId(),
                saved.getFullname(),
                saved.getEmail(),
                saved.getPhone(),
                saved.getBirthday(),
                saved.getGender(),
                saved.getPreferredArea(),
                saved.getAvatarUrl(),
                saved.isVerify()
        );
    }

    // Đổi mật khẩu tài khoản người dùng
    @Override
    public void changePassword(String email, com.nhom10.tmdt.dto.user.ChangePasswordRequest request) {
        if (request.currentPassword() == null || request.currentPassword().isBlank()
                || request.newPassword() == null || request.newPassword().isBlank()) {
            throw new AppException(ErrorCode.BAD_REQUEST);
        }

        // Kiểm tra khớp mật khẩu xác nhận
        if (request.confirmPassword() != null && !request.newPassword().equals(request.confirmPassword())) {
            throw new AppException(ErrorCode.NOT_MATCH_PASSWORD);
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));

        // Kiểm tra mật khẩu hiện tại
        if (!bCryptPasswordEncoder.matches(request.currentPassword(), user.getPassword())) {
            throw new AppException(ErrorCode.CURRENT_PASSWORD_INCORRECT);
        }

        // Kiểm tra mật khẩu mới không được trùng mật khẩu hiện tại
        if (bCryptPasswordEncoder.matches(request.newPassword(), user.getPassword())) {
            throw new AppException(ErrorCode.PASSWORD_SAME_AS_OLD);
        }

        // Mã hóa mật khẩu mới và lưu vào cơ sở dữ liệu
        user.setPassword(bCryptPasswordEncoder.encode(request.newPassword().trim()));
        userRepository.save(user);
    }
}

