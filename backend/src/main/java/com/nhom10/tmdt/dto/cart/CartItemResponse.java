package com.nhom10.tmdt.dto.cart;

public record CartItemResponse(
        Long id,
        Long productId,
        String productName,
        String description,
        String factoryName,
        String thumbnailUrl,
        Double price,
        Double basePrice,
        Integer quantity,
        Integer stockQuantity,
        String stockStatus,
        Double lineTotal,
        Long productMilId,
        Integer mil
) {
}
