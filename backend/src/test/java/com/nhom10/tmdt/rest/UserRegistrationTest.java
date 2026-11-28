package com.nhom10.tmdt.rest;

import com.nhom10.tmdt.config.GlobalExceptionHandler;
import com.nhom10.tmdt.config.JwtService;
import com.nhom10.tmdt.enums.ErrorCode;
import com.nhom10.tmdt.model.Role;
import com.nhom10.tmdt.model.User;
import com.nhom10.tmdt.repo.FactoryRepository;
import com.nhom10.tmdt.repo.RoleRepository;
import com.nhom10.tmdt.repo.UserRepository;
import com.nhom10.tmdt.service.imp.EmailServieImp;
import com.nhom10.tmdt.service.user.UserServiceImp;
import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.mail.MailAuthenticationException;
import org.springframework.mail.MailException;
import org.springframework.mail.MailSendException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.net.SocketTimeoutException;
import java.util.Optional;
import java.util.Properties;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class UserRegistrationTest {
    @Mock JwtService jwtService;
    @Mock UserRepository users;
    @Mock BCryptPasswordEncoder encoder;
    @Mock RoleRepository roles;
    @Mock FactoryRepository factories;
    @Mock JavaMailSender sender;
    private MockMvc mvc;

    private static final String REQUEST = """
            {"fullname":"Registration Test","email":"REGISTRATION-TEST@EXAMPLE.INVALID",
             "phone":"0900000000","password":"TestPassword123!","verifyPassword":"TestPassword123!"}
            """;

    @BeforeEach
    void setUp() {
        EmailServieImp email = new EmailServieImp(sender);
        ReflectionTestUtils.setField(email, "mailFrom", "noreply@example.invalid");
        UserServiceImp service = new UserServiceImp(jwtService, users, encoder, roles, factories, email);
        mvc = MockMvcBuilders.standaloneSetup(new UserController(service))
                .setControllerAdvice(new GlobalExceptionHandler()).build();
    }

    private void prepareEmail() {
        when(roles.findByName("USER")).thenReturn(Optional.of(mock(Role.class)));
        when(sender.createMimeMessage()).thenReturn(new MimeMessage(Session.getInstance(new Properties())));
    }

    @Test
    void mailAuthenticationFailureReturnsRetryableErrorWithoutCreatingAccount() throws Exception {
        assertMailFailure(new MailAuthenticationException("private SMTP details"));
    }

    @Test
    void mailTimeoutReturnsRetryableErrorWithoutCreatingAccount() throws Exception {
        assertMailFailure(new MailSendException("private SMTP details", new SocketTimeoutException()));
    }

    private void assertMailFailure(MailException failure) throws Exception {
        prepareEmail();
        doThrow(failure).when(sender).send(any(MimeMessage.class));
        var result = mvc.perform(post("/auth/register").contentType(MediaType.APPLICATION_JSON).content(REQUEST))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.status").value(503))
                .andExpect(jsonPath("$.message").value(ErrorCode.EMAIL_SERVICE_UNAVAILABLE.getMessage()))
                .andReturn();
        assertFalse(result.getResponse().getContentAsString().contains("private SMTP details"));
        verify(users, never()).save(any(User.class));
        verifyNoInteractions(encoder);
    }

    @Test
    void duplicateEmailIsAConflictAndDoesNotSendAnotherEmail() throws Exception {
        when(users.existsUserByEmail("registration-test@example.invalid")).thenReturn(true);
        mvc.perform(post("/auth/register").contentType(MediaType.APPLICATION_JSON).content(REQUEST))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value(ErrorCode.EMAIL_EXISTED.getMessage()));
        verifyNoInteractions(sender);
        verify(users, never()).save(any(User.class));
    }

    @Test
    void successfulDeliveryCreatesAnUnverifiedAccountWithEncodedPassword() throws Exception {
        prepareEmail();
        when(encoder.encode("TestPassword123!")).thenReturn("encoded-test-password");
        mvc.perform(post("/auth/register").contentType(MediaType.APPLICATION_JSON).content(REQUEST))
                .andExpect(status().isCreated());
        ArgumentCaptor<User> saved = ArgumentCaptor.forClass(User.class);
        verify(users).save(saved.capture());
        assertEquals("registration-test@example.invalid", saved.getValue().getEmail());
        assertEquals("encoded-test-password", saved.getValue().getPassword());
        assertFalse(saved.getValue().isVerify());
        assertNotNull(saved.getValue().getVerifyCodeExpiresAt());
        verify(sender).send(any(MimeMessage.class));
    }
}
