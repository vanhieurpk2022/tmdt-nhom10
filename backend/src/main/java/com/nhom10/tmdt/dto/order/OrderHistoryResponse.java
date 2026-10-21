package com.nhom10.tmdt.dto.order;

import java.util.List;
import java.util.Map;

public record OrderHistoryResponse(List<OrderResponse> orders, int page, int totalPages, long totalElements,
                                   Map<String, Long> statusCounts, Summary summary) {
    public record Summary(long totalOrders, long deliveredOrders, double totalSpent) {}
}
