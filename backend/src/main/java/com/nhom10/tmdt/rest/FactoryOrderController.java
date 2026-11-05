package com.nhom10.tmdt.rest;

import com.nhom10.tmdt.dto.ApiResponse;
import com.nhom10.tmdt.dto.admin.AdminOrderDetailResponse;
import com.nhom10.tmdt.dto.admin.AdminOrderPageResponse;
import com.nhom10.tmdt.dto.admin.AdminOrderStatsResponse;
import com.nhom10.tmdt.dto.admin.UpdateOrderStatusRequest;
import com.nhom10.tmdt.enums.OrderStatus;
import com.nhom10.tmdt.service.factory.FactoryOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/manager/orders")
public class FactoryOrderController {

    private final FactoryOrderService factoryOrderService;

    /**
     * Lấy danh sách đơn hàng của xưởng gia công
     */
    @GetMapping
    public ApiResponse<AdminOrderPageResponse> getOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        AdminOrderPageResponse response = factoryOrderService.getOrders(userDetails, page, size, search, status, sortBy, sortDir);
        return new ApiResponse<>(200, "Lấy danh sách đơn hàng xưởng thành công", response);
    }

    /**
     * Thống kê số lượng đơn hàng theo các trạng thái của xưởng
     */
    @GetMapping("/stats")
    public ApiResponse<AdminOrderStatsResponse> getOrderStats(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        AdminOrderStatsResponse stats = factoryOrderService.getOrderStats(userDetails);
        return new ApiResponse<>(200, "Lấy thống kê đơn hàng xưởng thành công", stats);
    }

    /**
     * Lấy chi tiết đơn hàng của xưởng
     */
    @GetMapping("/{id}")
    public ApiResponse<AdminOrderDetailResponse> getOrderDetail(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        AdminOrderDetailResponse detail = factoryOrderService.getOrderDetail(userDetails, id);
        return new ApiResponse<>(200, "Lấy chi tiết đơn hàng xưởng thành công", detail);
    }

    /**
     * Cập nhật trạng thái đơn hàng của xưởng
     */
    @PatchMapping("/{id}/status")
    public ApiResponse<AdminOrderDetailResponse> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody UpdateOrderStatusRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        AdminOrderDetailResponse updated = factoryOrderService.updateOrderStatus(userDetails, id, request);
        return new ApiResponse<>(200, "Cập nhật trạng thái đơn hàng thành công", updated);
    }

    /**
     * Hủy đơn hàng của xưởng
     */
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteOrder(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        factoryOrderService.deleteOrder(userDetails, id);
        return new ApiResponse<>(200, "Hủy đơn hàng thành công", null);
    }
}
