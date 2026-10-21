package com.nhom10.tmdt.service.user;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.nhom10.tmdt.config.AppException;
import com.nhom10.tmdt.config.JwtService;
import com.nhom10.tmdt.dto.user.CreateUserRequest;
import com.nhom10.tmdt.dto.user.FacebookLoginRequest;
import com.nhom10.tmdt.dto.user.GoogleLoginRequest;
import com.nhom10.tmdt.dto.user.LoginRequest;
import com.nhom10.tmdt.dto.user.LoginResponse;
import com.nhom10.tmdt.enums.ErrorCode;
import com.nhom10.tmdt.enums.FactoryStatus;
import com.nhom10.tmdt.enums.RoleName;
import com.nhom10.tmdt.model.Factory;
import com.nhom10.tmdt.model.Role;
import com.nhom10.tmdt.model.User;
import com.nhom10.tmdt.repo.FactoryRepository;
import com.nhom10.tmdt.repo.RoleRepository;
import com.nhom10.tmdt.repo.UserRepository;
import com.nhom10.tmdt.service.imp.EmailSevice;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@RequiredArgsConstructor
@Service
public class UserServiceImp implements UserService {

    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;
    private final RoleRepository roleRepository;
    private final FactoryRepository factoryRepository;
    private final EmailSevice emailSevice;

    @Value("${google.client-id}")
    private String googleClientId;

    @Override
    public LoginResponse.UserResponse getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new AppException(ErrorCode.NOT_FOUND)
                );

        List<String> roles = user.getRoles().stream().map(Role::getName).toList();

        return new LoginResponse.UserResponse(
                user.getId(),
                user.getEmail(),
                user.getFullname(),
                user.getAvatarUrl(),
                roles
        );
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
    public LoginResponse loginWithGoogle(GoogleLoginRequest request) {
        GoogleIdToken.Payload payload = verifyGoogleToken(request.credential());

        String email = payload.getEmail();
        String rawName = (String) payload.get("name");
        String fullname = (rawName != null && !rawName.isBlank()) ? rawName : email.split("@")[0];
        String avatarUrl = (String) payload.get("picture");

        // tìm và tạo user mới
        User user = userRepository.findByEmail(email).orElseGet(() -> {
            Role userRole = roleRepository.findByName(RoleName.USER.name())
                    .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));
            return userRepository.save(User.builder()
                    .email(email)
                    .fullname(fullname)
                    .avatarUrl(avatarUrl)
                    .password(bCryptPasswordEncoder.encode(UUID.randomUUID().toString()))
                    .isVerify(true)
                    .roles(new HashSet<>(Set.of(userRole)))
                    .build());
        });

        // user tồn tại nhưng chưa verify
        if (!user.isVerify()) {
            user.setVerify(true);
            user.setCodeActive(null);
            user.setVerifyCodeExpiresAt(null);
            userRepository.save(user);
        }

        // Cập nhật avatar từ Google nếu chưa có
        if (avatarUrl != null && (user.getAvatarUrl() == null || user.getAvatarUrl().isBlank())) {
            user.setAvatarUrl(avatarUrl);
            userRepository.save(user);
        }

        // 3. Tạo JWT và trả về
        List<String> roles = user.getRoles().stream().map(Role::getName).toList();

        String accessToken = jwtService.generateToken(
                user.getEmail(), user.getAvatarUrl() != null ? user.getAvatarUrl() : "",
                user.getFullname(), user.isVerify(), roles);
        long expiresIn = jwtService.getExpirationSeconds(request.rememberMe());

        LoginResponse.UserResponse userDto = new LoginResponse.UserResponse(
                user.getId(), user.getEmail(), user.getFullname(), user.getAvatarUrl(), roles);

        return new LoginResponse(accessToken, "Bearer", expiresIn, userDto);
    }

    @Override
    public LoginResponse loginWithFacebook(FacebookLoginRequest request) {
        if (request.accessToken() == null || request.accessToken().isBlank()) {
            throw new AppException(ErrorCode.INVALID_CREDENTIALS);
        }

        FacebookUserInfo fbUser = fetchFacebookUserInfo(request.accessToken());

        String email = fbUser.email();
        if (email == null || email.isBlank()) {
            email = "fb_" + fbUser.id() + "@facebook.com";
        }

        String fullname = (fbUser.name() != null && !fbUser.name().isBlank()) ? fbUser.name() : "Facebook User";
        String avatarUrl = fbUser.avatarUrl();

        final String userEmail = email;
        User user = userRepository.findByEmail(userEmail).orElseGet(() -> {
            Role userRole = roleRepository.findByName(RoleName.USER.name())
                    .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));
            return userRepository.save(User.builder()
                    .email(userEmail)
                    .fullname(fullname)
                    .avatarUrl(avatarUrl)
                    .password(bCryptPasswordEncoder.encode(UUID.randomUUID().toString()))
                    .isVerify(true)
                    .roles(new HashSet<>(Set.of(userRole)))
                    .build());
        });

        if (!user.isVerify()) {
            user.setVerify(true);
            user.setCodeActive(null);
            user.setVerifyCodeExpiresAt(null);
            userRepository.save(user);
        }

        if (avatarUrl != null && (user.getAvatarUrl() == null || user.getAvatarUrl().isBlank())) {
            user.setAvatarUrl(avatarUrl);
            userRepository.save(user);
        }

        List<String> roles = user.getRoles().stream().map(Role::getName).toList();

        String accessToken = jwtService.generateToken(
                user.getEmail(), user.getAvatarUrl() != null ? user.getAvatarUrl() : "",
                user.getFullname(), user.isVerify(), roles);
        long expiresIn = jwtService.getExpirationSeconds(request.rememberMe());

        LoginResponse.UserResponse userDto = new LoginResponse.UserResponse(
                user.getId(), user.getEmail(), user.getFullname(), user.getAvatarUrl(), roles);

        return new LoginResponse(accessToken, "Bearer", expiresIn, userDto);
    }

    private record FacebookUserInfo(String id, String name, String email, String avatarUrl) {}

    private FacebookUserInfo fetchFacebookUserInfo(String accessToken) {
        try {
            java.net.http.HttpClient client = java.net.http.HttpClient.newHttpClient();
            String uri = "https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token="
                    + java.net.URLEncoder.encode(accessToken, java.nio.charset.StandardCharsets.UTF_8);

            java.net.http.HttpRequest req = java.net.http.HttpRequest.newBuilder()
                    .uri(java.net.URI.create(uri))
                    .GET()
                    .build();

            java.net.http.HttpResponse<String> resp = client.send(req,
                    java.net.http.HttpResponse.BodyHandlers.ofString());

            if (resp.statusCode() != 200) {
                throw new AppException(ErrorCode.INVALID_CREDENTIALS);
            }

            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            com.fasterxml.jackson.databind.JsonNode node = mapper.readTree(resp.body());

            String id = node.path("id").asText(null);
            if (id == null || id.isBlank()) {
                throw new AppException(ErrorCode.INVALID_CREDENTIALS);
            }

            String name = node.hasNonNull("name") ? node.path("name").asText() : null;
            String email = node.hasNonNull("email") ? node.path("email").asText() : null;
            String avatarUrl = null;
            if (node.has("picture") && node.get("picture").has("data")) {
                avatarUrl = node.get("picture").get("data").path("url").asText(null);
            }

            return new FacebookUserInfo(id, name, email, avatarUrl);
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            throw new AppException(ErrorCode.INVALID_CREDENTIALS);
        }
    }

// verify google token
    private GoogleIdToken.Payload verifyGoogleToken(String credential) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(), new GsonFactory())
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken idToken = verifier.verify(credential);
            if (idToken != null) {
                return idToken.getPayload();
            }

            return fetchGoogleUserInfo(credential);

        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            try {
                return fetchGoogleUserInfo(credential);
            } catch (Exception ex) {
                throw new AppException(ErrorCode.INVALID_CREDENTIALS);
            }
        }
    }

    private GoogleIdToken.Payload fetchGoogleUserInfo(String accessToken) throws Exception {
        java.net.http.HttpClient client = java.net.http.HttpClient.newHttpClient();
        java.net.http.HttpRequest req = java.net.http.HttpRequest.newBuilder()
                .uri(java.net.URI.create("https://www.googleapis.com/oauth2/v3/userinfo"))
                .header("Authorization", "Bearer " + accessToken)
                .GET()
                .build();

        java.net.http.HttpResponse<String> resp = client.send(req,
                java.net.http.HttpResponse.BodyHandlers.ofString());

        if (resp.statusCode() != 200) {
            throw new AppException(ErrorCode.INVALID_CREDENTIALS);
        }

        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
        com.fasterxml.jackson.databind.JsonNode node = mapper.readTree(resp.body());

        GoogleIdToken.Payload payload = new GoogleIdToken.Payload();
        payload.setEmail(node.path("email").asText());
        payload.set("name", node.path("name").asText());
        payload.set("picture", node.path("picture").asText());
        payload.setSubject(node.path("sub").asText());

        return payload;
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

