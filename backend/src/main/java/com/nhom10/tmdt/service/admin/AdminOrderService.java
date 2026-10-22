package com.nhom10.tmdt.service.admin;

import com.nhom10.tmdt.dto.admin.*;
import com.nhom10.tmdt.enums.OrderStatus;

public interface AdminOrderService {
    AdminOrderPageResponse getOrders(int page, int size, String search, OrderStatus status, String sortBy, String sortDir);
    AdminOrderStatsResponse getOrderStats();
    AdminOrderDetailResponse getOrderDetail(Long id);
    AdminOrderDetailResponse updateOrderStatus(Long id, UpdateOrderStatusRequest request);
    AdminOrderDetailResponse createDispatchOrder(AdminCreateDispatchOrderRequest request);
    void deleteOrder(Long id);
    //receive
}
