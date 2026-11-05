package com.nhom10.tmdt.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminOrderStatsResponse {
    private long totalOrders;
    private long pendingCount;
    private long processingCount;
    private long deliveringCount;
    private long deliveredCount;
    private long cancelledCount;
    private double totalRevenue;
}
