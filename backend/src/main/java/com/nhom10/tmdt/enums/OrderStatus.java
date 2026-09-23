package com.nhom10.tmdt.enums;

public enum OrderStatus {
    PENDING,        // Chờ xác nhận
    CONFIRMED,      // Đã xác nhận
    PROCESSING,     // Đang xử lý / đóng gói
    SHIPPED,        // Đã giao cho đơn vị vận chuyển
    DELIVERING,     // Đang giao
    DELIVERED,      // Đã giao thành công
    CANCELLED,      // Đã hủy
    RETURNED,       // Đã hoàn trả
    REFUNDED        // Đã hoàn tiền
}
