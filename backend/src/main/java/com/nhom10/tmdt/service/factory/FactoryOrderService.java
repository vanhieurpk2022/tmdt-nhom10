package com.nhom10.tmdt.service.factory;

import com.nhom10.tmdt.dto.admin.AdminOrderDetailResponse;
import com.nhom10.tmdt.dto.admin.AdminOrderPageResponse;
import com.nhom10.tmdt.dto.admin.AdminOrderStatsResponse;
import com.nhom10.tmdt.dto.admin.UpdateOrderStatusRequest;
import com.nhom10.tmdt.enums.OrderStatus;
import org.springframework.security.core.userdetails.UserDetails;

public interface FactoryOrderService {
    AdminOrderPageResponse getOrders(UserDetails userDetails, int page, int size, String search, OrderStatus status, String sortBy, String sortDir);
    AdminOrderStatsResponse getOrderStats(UserDetails userDetails);
    AdminOrderDetailResponse getOrderDetail(UserDetails userDetails, Long id);
    AdminOrderDetailResponse updateOrderStatus(UserDetails userDetails, Long id, UpdateOrderStatusRequest request);
    void deleteOrder(UserDetails userDetails, Long id);
}
