package com.nhom10.tmdt.rest;

import com.nhom10.tmdt.dto.ApiResponse;
import com.nhom10.tmdt.dto.admin.*;
import com.nhom10.tmdt.enums.ProductStatus;
import com.nhom10.tmdt.enums.ProductType;
import com.nhom10.tmdt.service.admin.AdminProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/admin/products")
public class AdminProductController {

    private final AdminProductService adminProductService;

    /**
     * Lấy danh sách sản phẩm toàn sàn cho Admin
     * Hỗ trợ tìm kiếm, phân trang và lọc đa chiều theo xưởng, danh mục, loại sản phẩm, trạng thái
     */
    @GetMapping
    public ApiResponse<AdminProductPageResponse> getProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long factoryId,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) ProductType productType,
            @RequestParam(required = false) ProductStatus status,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        AdminProductPageResponse response = adminProductService.getProducts(
                page, size, search, factoryId, categoryId, productType, status, sortBy, sortDir
        );
        return new ApiResponse<>(200, "Lấy danh sách sản phẩm toàn sàn thành công", response);
    }

    /**
     * Lấy thống kê số lượng sản phẩm toàn hệ thống
     * (tổng sản phẩm, đang bán, hết hàng, tạm ngưng, độc bản, tiêu chuẩn, tổng số xưởng)
     */
    @GetMapping("/stats")
    public ApiResponse<AdminProductStatsResponse> getProductStats() {
        AdminProductStatsResponse stats = adminProductService.getProductStats();
        return new ApiResponse<>(200, "Lấy thống kê sản phẩm thành công", stats);
    }

    /**
     * Lấy thông tin chi tiết một sản phẩm:
     * Bao gồm thông tin xưởng chế tác, các biến thể dung tích, kim tự tháp hương và công thức phối trộn
     */
    @GetMapping("/{id}")
    public ApiResponse<AdminProductDetailResponse> getProductDetail(@PathVariable Long id) {
        AdminProductDetailResponse detail = adminProductService.getProductDetail(id);
        return new ApiResponse<>(200, "Lấy chi tiết sản phẩm thành công", detail);
    }

    /**
     * Cập nhật trạng thái sản phẩm (ACTIVE, INACTIVE, OUT_OF_STOCK, DRAFT, ARCHIVED)
     */
    @PatchMapping("/{id}/status")
    public ApiResponse<AdminProductDetailResponse> updateProductStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateProductStatusRequest request
    ) {
        AdminProductDetailResponse updated = adminProductService.updateProductStatus(id, request);
        return new ApiResponse<>(200, "Cập nhật trạng thái sản phẩm thành công", updated);
    }

    /**
     * Xóa / Lưu trữ sản phẩm
     */
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteProduct(@PathVariable Long id) {
        adminProductService.deleteProduct(id);
        return new ApiResponse<>(200, "Lưu trữ sản phẩm thành công", null);
    }
}

