package com.nhom10.tmdt.security;

import java.util.List;

public class Endpoints {
    public static final String HOST = "http://localhost:5173";
    public static final List<String> FRONTEND_HOSTS = List.of(
            "http://localhost:5173",
            "http://127.0.0.1:5173"
    );

    public static final String[] PUBLIC_GET = {
            "/error",
            // Auth (kiểm tra phiên & xác thực email)
            "/auth/me",
            "/auth/verify-email",
            // Catalog sản phẩm, xưởng & phối hương công khai
            "/products/**",
            "/factories",
            "/factories/*",
            "/factories/*/categories",
            "/custom-scent/**",
            // Địa giới hành chính (GHN)
            "/shipping/provinces",
            "/shipping/districts",
            "/shipping/wards",
            // Callback / IPN từ VNPay (xác thực chữ ký HMAC)
            "/payments/vnpay/ipn",
            "/payments/vnpay/return",
            // Spring Data REST GET công khai mà FE đang dùng
            "/v1/category",
            "/v1/category/**",
            "/v1/product-image/search/byProductId"
    };


    public static final String[] PUBLIC_POST = {
            "/auth/login",
            "/auth/logout",
            "/auth/register",
            "/auth/resend",
            "/auth/google",
            "/auth/facebook",
            "/auth/forgot-password",
            "/auth/verify-recovery-code",
            "/auth/reset-password"
    };
    public static final String[] ADMIN_ENDPOINT = {
            "/admin/**",
            "/v1/role",
            "/v1/role/**",
            "/v1/user/*/roles",
            "/v1/user/*/roles/**"
    };

    public static final String[] FACTORY_ENDPOINT = {
            // Thống kê Dashboard xưởng
            "/manager/dashboard/**",
            // Quản lý sản phẩm, biến thể (mil), công thức custom & ảnh thumbnail
            "/manager/products/**",
            "/manager/productMils/**",
            "/manager/product-mil/**",
            "/manager/product-images/**",
            // Quản lý mẫu chai & nhãn mặc định
            "/manager/custom-bottle-samples/**",
            "/manager/default-bottle-labels/**",
            // Quản lý đơn hàng của xưởng
            "/manager/orders/**",
            // Quản lý nhân viên xưởng (cân nhắc giới hạn riêng cho OWNER / ROLE_FACTORY nếu tách quyền STAFF)
            "/manager/staffs/**"
    };
}
