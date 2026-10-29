package com.nhom10.tmdt.service.user;

import com.nhom10.tmdt.config.AppException;
import com.nhom10.tmdt.config.JwtService;
import com.nhom10.tmdt.dto.user.GoogleLoginRequest;
import com.nhom10.tmdt.enums.ErrorCode;
import com.nhom10.tmdt.repo.FactoryRepository;
import com.nhom10.tmdt.repo.RoleRepository;
import com.nhom10.tmdt.repo.UserRepository;
import com.nhom10.tmdt.service.imp.EmailSevice;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import javax.net.ssl.SSLHandshakeException;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GoogleLoginFailureTest {
    @Mock JwtService jwtService;
    @Mock UserRepository userRepository;
    @Mock BCryptPasswordEncoder passwordEncoder;
    @Mock RoleRepository roleRepository;
    @Mock FactoryRepository factoryRepository;
    @Mock EmailSevice emailSevice;
    @InjectMocks UserServiceImp service;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(service, "googleClientId", "test-client-id");
    }

    @Test
    void tlsFailureIsAProviderOutageInsteadOfWrongPassword() throws Exception {
        try (var clients = mockStatic(HttpClient.class)) {
            HttpClient client = mock(HttpClient.class);
            clients.when(HttpClient::newHttpClient).thenReturn(client);
            when(client.send(any(HttpRequest.class), any(HttpResponse.BodyHandler.class)))
                    .thenThrow(new SSLHandshakeException("PKIX path building failed"));

            AppException error = assertThrows(AppException.class,
                    () -> service.loginWithGoogle(new GoogleLoginRequest("opaque-access-token", false)));
            assertEquals(ErrorCode.GOOGLE_AUTH_UNAVAILABLE, error.getErrorCode());
            assertEquals(503, error.getErrorCode().getCode());
            verifyNoInteractions(userRepository, jwtService);
        }
    }

    @Test
    void invalidTokenRemainsUnauthorized() throws Exception {
        assertProviderStatus(401, ErrorCode.GOOGLE_AUTH_FAILED);
    }

    @Test
    void providerServerFailureIsRetryable() throws Exception {
        assertProviderStatus(503, ErrorCode.GOOGLE_AUTH_UNAVAILABLE);
    }

    private void assertProviderStatus(int status, ErrorCode expected) throws Exception {
        try (var clients = mockStatic(HttpClient.class)) {
            HttpClient client = mock(HttpClient.class);
            HttpResponse<String> response = mock(HttpResponse.class);
            clients.when(HttpClient::newHttpClient).thenReturn(client);
            when(client.send(any(HttpRequest.class), any(HttpResponse.BodyHandler.class))).thenReturn(response);
            when(response.statusCode()).thenReturn(status);

            AppException error = assertThrows(AppException.class,
                    () -> service.loginWithGoogle(new GoogleLoginRequest("opaque-access-token", false)));
            assertEquals(expected, error.getErrorCode());
            verifyNoInteractions(userRepository, jwtService);
        }
    }

    @Test
    void missingTokenDoesNotContactGoogleOrCreateAUser() {
        try (var clients = mockStatic(HttpClient.class)) {
            AppException error = assertThrows(AppException.class,
                    () -> service.loginWithGoogle(new GoogleLoginRequest(null, false)));
            assertEquals(ErrorCode.GOOGLE_AUTH_FAILED, error.getErrorCode());
            clients.verifyNoInteractions();
            verifyNoInteractions(userRepository, jwtService);
        }
    }
}
