package com.nhom10.tmdt.rest;

import com.nhom10.tmdt.dto.ApiResponse;
import com.nhom10.tmdt.dto.product.*;
import com.nhom10.tmdt.service.imp.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/products")
public class ProductController {

    private final ProductService productService;

    /**
     * GET /api/products/filter-meta
     * Trả về danh sách category + factory kèm số lượng sản phẩm.
     * Gọi 1 lần khi load trang để render sidebar bộ lọc.
     */
    @GetMapping("/filter-meta")
    public ApiResponse<FilterMetaResponse> getFilterMeta() {
        return new ApiResponse<>(200, "Lấy metadata bộ lọc thành công", productService.getFilterMeta());
    }

    /**
     * GET /api/products/newest
     * Lấy sản phẩm mới nhất để hiển thị trên trang chủ.
     */
    @GetMapping("/newest")
    public ApiResponse<List<ProductCardResponse>> getNewestProducts(
            @RequestParam(defaultValue = "4") Integer limit
    ) {
        return new ApiResponse<>(200, "Lấy danh sách sản phẩm mới nhất thành công", productService.getNewestProducts(limit));
    }

    /**
     * GET /api/products/best-sellers
     * Lấy sản phẩm bán chạy để hiển thị trên trang chủ.
     */
    @GetMapping("/best-sellers")
    public ApiResponse<List<ProductCardResponse>> getBestSellerProducts(
            @RequestParam(defaultValue = "4") Integer limit
    ) {
        return new ApiResponse<>(200, "Lấy danh sách sản phẩm bán chạy thành công", productService.getBestSellerProducts(limit));
    }

    /**
     * GET /api/products/filter
     * Lọc sản phẩm theo các tiêu chí: category, factory, giá, rating, sort, phân trang.
     */
    @GetMapping("/filter")
    public ApiResponse<ProductPageResponse> filter(
            @RequestParam(required = false) List<Long> categoryIds,
            @RequestParam(required = false) List<Long> factoryIds,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) Integer minRating,
            @RequestParam(defaultValue = "popular") String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size
    ) {
        ProductFilterRequest req = new ProductFilterRequest(
                categoryIds, factoryIds, minPrice, maxPrice, minRating, sort, page, size
        );
        return new ApiResponse<>(200, "Lấy danh sách sản phẩm thành công", productService.filterProducts(req));
    }
}
