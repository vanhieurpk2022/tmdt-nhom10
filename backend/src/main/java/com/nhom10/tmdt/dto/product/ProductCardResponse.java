package com.nhom10.tmdt.dto.product;

public record ProductCardResponse(
        Long id,
        String name,
        String description,
        String factoryName,
        Double price,
        Double avgRating,
        Long totalSold,
        String stockStatus,  // "Còn hàng" | "Sắp hết" | "Hết hàng"
        String thumbnailUrl
) {}
