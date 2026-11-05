package com.nhom10.tmdt.rest;

import com.nhom10.tmdt.dto.ApiResponse;
import com.nhom10.tmdt.dto.admin.dashboard.AdminBarChartResponseDto;
import com.nhom10.tmdt.dto.admin.dashboard.AdminDashboardFullResponseDto;
import com.nhom10.tmdt.dto.admin.dashboard.AdminDashboardOverviewDto;
import com.nhom10.tmdt.dto.admin.dashboard.AdminPieChartDataDto;
import com.nhom10.tmdt.service.admin.AdminDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequiredArgsConstructor
@RequestMapping("/admin/dashboard")
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;

    /**
     * Lấy các chỉ số KPI tóm tắt đầu trang tổng quan
     * (Doanh thu, Đơn hàng, Tỷ lệ giao/hủy, Xưởng chế tác, Khách hàng, Đánh giá, Tranh chấp)
     */
    @GetMapping("/overview")
    public ApiResponse<AdminDashboardOverviewDto> getOverview() {
        AdminDashboardOverviewDto data = adminDashboardService.getOverviewStats();
        return new ApiResponse<>(200, "Lấy dữ liệu tổng quan thành công", data);
    }

    @GetMapping("/bar-chart")
    public ApiResponse<AdminBarChartResponseDto> getBarChart(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) String period,
            @RequestParam(required = false) String groupBy
    ) {
        AdminBarChartResponseDto data = adminDashboardService.getBarChartStats(from, to, period, groupBy);
        return new ApiResponse<>(200, "Lấy dữ liệu biểu đồ cột thành công", data);
    }

    /**
     * Lấy dữ liệu các biểu đồ tròn trên trang tổng quan
     * (Trạng thái đơn hàng, Doanh thu theo danh mục, Loại sản phẩm, Lý do hủy, Phương thức thanh toán, Top xưởng)
     */
    @GetMapping("/pie-charts")
    public ApiResponse<AdminPieChartDataDto> getPieCharts() {
        AdminPieChartDataDto data = adminDashboardService.getPieChartStats();
        return new ApiResponse<>(200, "Lấy dữ liệu biểu đồ tròn thành công", data);
    }

    /**
     * Lấy trọn bộ dữ liệu trang tổng quan 
     */
    @GetMapping("/full")
    public ApiResponse<AdminDashboardFullResponseDto> getFullDashboard(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) String period,
            @RequestParam(required = false) String groupBy
    ) {
        AdminDashboardFullResponseDto data = adminDashboardService.getFullDashboard(from, to, period, groupBy);
        return new ApiResponse<>(200, "Lấy trọn bộ dữ liệu tổng quan thành công", data);
    }
}

