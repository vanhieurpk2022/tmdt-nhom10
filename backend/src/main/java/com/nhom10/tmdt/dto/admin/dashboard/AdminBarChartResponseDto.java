package com.nhom10.tmdt.dto.admin.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminBarChartResponseDto {
    private LocalDate fromDate;
    private LocalDate toDate;
    private String groupBy;        
    private double totalPeriodRevenue;
    private long totalPeriodOrders;
    private long totalPeriodQuantity;
    private List<AdminBarChartItemDto> items;
}

