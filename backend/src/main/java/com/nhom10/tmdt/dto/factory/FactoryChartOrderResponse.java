package com.nhom10.tmdt.dto.factory;

import com.nhom10.tmdt.enums.OrderStatus;

/**
 * DTO cho biểu đồ dashboard: mỗi bản ghi là 1 đơn hàng
 * với đủ thông tin để frontend nhóm theo ngày/tháng.
 */
public record FactoryChartOrderResponse(
        Long idOrder,
        String time,           // createdAt ISO string
        int totalQuantity,     // tổng số item
        double price,          // totalPrice
        OrderStatus status
) {}
