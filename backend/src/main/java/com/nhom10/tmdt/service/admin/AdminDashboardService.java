package com.nhom10.tmdt.service.admin;

import com.nhom10.tmdt.dto.admin.dashboard.AdminBarChartResponseDto;
import com.nhom10.tmdt.dto.admin.dashboard.AdminDashboardFullResponseDto;
import com.nhom10.tmdt.dto.admin.dashboard.AdminDashboardOverviewDto;
import com.nhom10.tmdt.dto.admin.dashboard.AdminPieChartDataDto;

import java.time.LocalDate;

public interface AdminDashboardService {

    AdminDashboardOverviewDto getOverviewStats();
    AdminBarChartResponseDto getBarChartStats(LocalDate from, LocalDate to, String period, String groupBy);
    AdminPieChartDataDto getPieChartStats();
    /**
     * Lấy trọn bộ dữ liệu trang tổng quan 
     */
    AdminDashboardFullResponseDto getFullDashboard(LocalDate from, LocalDate to, String period, String groupBy);
}

