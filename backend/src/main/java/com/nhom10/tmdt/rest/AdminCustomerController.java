package com.nhom10.tmdt.rest;

import com.nhom10.tmdt.dto.ApiResponse;
import com.nhom10.tmdt.dto.admin.*;
import com.nhom10.tmdt.enums.UserStatus;
import com.nhom10.tmdt.service.admin.AdminCustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping({"/admin/customers", "/admin/users"})
public class AdminCustomerController {

    private final AdminCustomerService adminCustomerService;

//   Lấy danh sách khách hàng
    @GetMapping
    public ApiResponse<AdminCustomerPageResponse> getCustomers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) UserStatus status,
            @RequestParam(required = false) String role,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        AdminCustomerPageResponse response = adminCustomerService.getCustomers(page, size, search, status, role, sortBy, sortDir);
        return new ApiResponse<>(200, "Lấy danh sách khách hàng thành công", response);
    }

// Thống kê tổng số khách hàng, số tài khoản hoạt động, bị khóa, tổng doanh thu
    @GetMapping("/stats")
    public ApiResponse<AdminCustomerStatsResponse> getCustomerStats() {
        AdminCustomerStatsResponse stats = adminCustomerService.getCustomerStats();
        return new ApiResponse<>(200, "Lấy thống kê khách hàng thành công", stats);
    }

// Lấy thông tin chi tiết của 1 khách hàng kèm danh sách địa chỉ và đơn hàng gần đây
    @GetMapping("/{id}")
    public ApiResponse<AdminCustomerDetailResponse> getCustomerDetail(@PathVariable Long id) {
        AdminCustomerDetailResponse detail = adminCustomerService.getCustomerDetail(id);
        return new ApiResponse<>(200, "Lấy chi tiết khách hàng thành công", detail);
    }

    // Phân quyền vai trò cho người dùng
    @PutMapping("/{id}/roles")
    public ApiResponse<AdminCustomerResponse> updateCustomerRoles(
            @PathVariable Long id,
            @RequestBody UpdateCustomerRolesRequest request
    ) {
        AdminCustomerResponse updated = adminCustomerService.updateCustomerRoles(id, request.roleNames());
        return new ApiResponse<>(200, "Cập nhật vai trò khách hàng thành công", updated);
    }

    // Cập nhật thông tin cơ bản khách hàng
    @PutMapping("/{id}")
    public ApiResponse<AdminCustomerResponse> updateCustomerInfo(
            @PathVariable Long id,
            @RequestBody UpdateCustomerInfoRequest request
    ) {
        AdminCustomerResponse updated = adminCustomerService.updateCustomerInfo(id, request);
        return new ApiResponse<>(200, "Cập nhật thông tin khách hàng thành công", updated);
    }

    // Khóa hoặc mở khóa tài khoản khách hàng
    @PutMapping("/{id}/status")
    public ApiResponse<AdminCustomerResponse> updateCustomerStatus(
            @PathVariable Long id,
            @RequestBody UpdateCustomerStatusRequest request
    ) {
        AdminCustomerResponse updated = adminCustomerService.updateCustomerStatus(id, request.status());
        return new ApiResponse<>(200, "Cập nhật trạng thái khách hàng thành công", updated);
    }

    // Cộng hoặc trừ số dư Store Credit của khách hàng
    @PutMapping("/{id}/credit")
    public ApiResponse<AdminCustomerResponse> updateCustomerStoreCredit(
            @PathVariable Long id,
            @RequestBody java.util.Map<String, Double> body
    ) {
        Double amount = body.getOrDefault("amount", 0.0);
        AdminCustomerResponse updated = adminCustomerService.updateStoreCredit(id, amount);
        return new ApiResponse<>(200, "Cập nhật Store Credit thành công", updated);
    }

    // Đặt lại mật khẩu khách hàng
    @PostMapping("/{id}/reset-password")
    public ApiResponse<String> resetCustomerPassword(@PathVariable Long id) {
        String newPassword = adminCustomerService.resetCustomerPassword(id);
        return new ApiResponse<>(200, "Đặt lại mật khẩu thành công. Mật khẩu mặc định: " + newPassword, newPassword);
    }
}