package com.nhom10.tmdt.security;

import com.nhom10.tmdt.enums.*;
import com.nhom10.tmdt.model.*;
import com.nhom10.tmdt.repo.UserRepository;
import org.junit.jupiter.api.*;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.server.ResponseStatusException;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class FactoryAccessTest {
    private final UserRepository users = mock(UserRepository.class);
    private final FactoryAccess access = new FactoryAccess(users);
    private User user;
    @BeforeEach void authenticate() {
        user = User.builder().email("factory@example.com").status(UserStatus.ACTIVE)
                .factory(Factory.builder().id(1L).build()).factoryRole(FactoryRole.STAFF).build();
        when(users.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(user.getEmail(), null, List.of()));
    }
    @AfterEach void clear() { SecurityContextHolder.clearContext(); }
    @Test void blocksOtherFactoryProduct() {
        assertThrows(ResponseStatusException.class, () -> access.product(Product.builder().factory(Factory.builder().id(2L).build()).build()));
    }
    @Test void permitsOwnProduct() {
        assertDoesNotThrow(() -> access.product(Product.builder().factory(user.getFactory()).build()));
    }
    @Test void staffCannotManageOtherStaff() { assertThrows(ResponseStatusException.class, access::owner); }
    @Test void inactiveStaffCannotAccessFactory() {
        user.setStatus(UserStatus.INACTIVE);
        assertThrows(ResponseStatusException.class, access::currentUser);
    }
}
