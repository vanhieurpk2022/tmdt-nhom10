package com.nhom10.tmdt.security;

import com.nhom10.tmdt.enums.FactoryRole;
import com.nhom10.tmdt.enums.UserStatus;
import com.nhom10.tmdt.model.*;
import com.nhom10.tmdt.repo.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import java.util.Objects;

/** Kiểm tra quyền tại service trước khi đọc hoặc thay đổi tài nguyên của xưởng. */
@Component
@RequiredArgsConstructor
public class FactoryAccess {
    private final UserRepository users;

    public User currentUser() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) throw denied();
        User user = users.findByEmail(authentication.getName()).orElseThrow(this::denied);
        if (user.getStatus() != UserStatus.ACTIVE || user.getFactory() == null) throw denied();
        return user;
    }

    public void owner() {
        if (currentUser().getFactoryRole() != FactoryRole.OWNER) throw denied();
    }

    public void product(Product product) {
        if (product == null || product.getFactory() == null
                || !Objects.equals(currentUser().getFactory().getId(), product.getFactory().getId())) throw denied();
    }

    public void variant(ProductMil variant) { product(variant == null ? null : variant.getProduct()); }
    public void image(ProductImage image) {
        if (image != null && image.getProduct() == null && image.getOwnerFactory() != null
                && Objects.equals(currentUser().getFactory().getId(), image.getOwnerFactory().getId())) return;
        product(image == null ? null : image.getProduct());
    }

    private ResponseStatusException denied() {
        return new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không có quyền thao tác tài nguyên này");
    }
}
