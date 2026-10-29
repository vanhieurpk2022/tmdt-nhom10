package com.nhom10.tmdt.service.admin;

import com.nhom10.tmdt.dto.admin.*;
import com.nhom10.tmdt.enums.OrderStatus;
import com.nhom10.tmdt.enums.PaymentStatus;
import com.nhom10.tmdt.enums.ProductType;

public interface AdminOrderService {
    AdminOrderPageResponse getOrders(
            int page,
            int size,
            String search,
            OrderStatus status,
            Long factoryId,
            ProductType productType,
            PaymentStatus paymentStatus,
            String sortBy,
            String sortDir
    );

    AdminOrderStatsResponse getOrderStats();

    AdminOrderDetailResponse getOrderDetail(Long id);

    AdminOrderDetailResponse updateOrderStatus(Long id, UpdateOrderStatusRequest request);

    void deleteOrder(Long id);
}
