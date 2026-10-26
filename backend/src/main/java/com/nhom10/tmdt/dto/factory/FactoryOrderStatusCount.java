package com.nhom10.tmdt.dto.factory;

import com.nhom10.tmdt.enums.OrderStatus;

/**
 * DTO chứa số lượng đơn theo từng trạng thái cho biểu đồ tròn
 */
public record FactoryOrderStatusCount(
        OrderStatus status,
        long count
) {}
