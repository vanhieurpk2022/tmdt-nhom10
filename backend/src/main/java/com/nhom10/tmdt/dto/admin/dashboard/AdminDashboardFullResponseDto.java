package com.nhom10.tmdt.dto.admin.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardFullResponseDto {
    private AdminDashboardOverviewDto overview;
    private AdminBarChartResponseDto barChart;
    private AdminPieChartDataDto pieCharts;
}

