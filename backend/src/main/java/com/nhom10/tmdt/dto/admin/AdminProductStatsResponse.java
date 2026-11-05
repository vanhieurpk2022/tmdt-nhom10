package com.nhom10.tmdt.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminProductStatsResponse {
    private long totalProducts;
    private long activeCount;
    private long outOfStockCount;
    private long inactiveCount;
    private long customCount;
    private long normalCount;
    private long totalWorkshops;
}

