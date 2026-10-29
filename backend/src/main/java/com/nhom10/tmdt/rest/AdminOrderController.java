package com.nhom10.tmdt.rest;

import com.nhom10.tmdt.dto.ApiResponse;
import com.nhom10.tmdt.dto.admin.*;
import com.nhom10.tmdt.enums.OrderStatus;
import com.nhom10.tmdt.service.admin.AdminOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/admin/orders")
public class AdminOrderController {

    private final AdminOrderService adminOrderService;

    /**
     * Lấy danh sách đơn hàng toàn sàn (phân trang, tìm kiếm, lọc theo trạng thái, xưởng, loại SP, TT thanh toán)
     */
    @GetMapping
    public ApiResponse<AdminOrderPageResponse> getOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(required = false) Long factoryId,
            @RequestParam(required = false) com.nhom10.tmdt.enums.ProductType productType,
            @RequestParam(required = false) com.nhom10.tmdt.enums.PaymentStatus paymentStatus,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        AdminOrderPageResponse response = adminOrderService.getOrders(
                page, size, search, status, factoryId, productType, paymentStatus, sortBy, sortDir
        );
        return new ApiResponse<>(200, "Lấy danh sách đơn hàng thành công", response);
    }

    /**
     * Thống kê số lượng đơn hàng theo các trạng thái và tổng doanh thu
     */
    @GetMapping("/stats")
    public ApiResponse<AdminOrderStatsResponse> getOrderStats() {
        AdminOrderStatsResponse stats = adminOrderService.getOrderStats();
        return new ApiResponse<>(200, "Lấy thống kê đơn hàng thành công", stats);
    }

    /**
     * Lấy chi tiết 1 đơn hàng (thông tin người nhận, khách đặt, danh sách sản phẩm, xưởng gia công)
     */
    @GetMapping("/{id}")
    public ApiResponse<AdminOrderDetailResponse> getOrderDetail(@PathVariable Long id) {
        AdminOrderDetailResponse detail = adminOrderService.getOrderDetail(id);
        return new ApiResponse<>(200, "Lấy chi tiết đơn hàng thành công", detail);
    }

    /**
     * Cập nhật trạng thái đơn hàng (PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED)
     */
    @PatchMapping("/{id}/status")
    public ApiResponse<AdminOrderDetailResponse> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody UpdateOrderStatusRequest request
    ) {
        AdminOrderDetailResponse updated = adminOrderService.updateOrderStatus(id, request);
        return new ApiResponse<>(200, "Cập nhật trạng thái đơn hàng thành công", updated);
    }

    /**
     * Hủy đơn hàng
     */
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteOrder(@PathVariable Long id) {
        adminOrderService.deleteOrder(id);
        return new ApiResponse<>(200, "Hủy đơn hàng thành công", null);
    }
}
