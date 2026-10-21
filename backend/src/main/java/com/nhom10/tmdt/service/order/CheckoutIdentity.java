package com.nhom10.tmdt.service.order;

import com.nhom10.tmdt.dto.order.CreateOrderRequest;
import com.nhom10.tmdt.model.Order;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;

public record CheckoutIdentity(String key, String fingerprint) {
    public static CheckoutIdentity from(String key, CreateOrderRequest request) {
        validateKey(key);
        return new CheckoutIdentity(key, digest(request.toString()));
    }

    public static void validateKey(String key) {
        if (key == null || !key.matches("[A-Za-z0-9_-]{16,80}")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Idempotency-Key phải có 16–80 ký tự");
        }
    }

    public void verify(Order order) {
        if (!fingerprint.equals(order.getCheckoutFingerprint())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Mã đặt hàng đã dùng cho nội dung khác");
        }
    }

    public static String digest(String value) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
                    .digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException(ex);
        }
    }
}
