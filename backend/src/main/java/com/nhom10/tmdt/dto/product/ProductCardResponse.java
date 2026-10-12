package com.nhom10.tmdt.dto.product;

import java.util.List;

public record ProductCardResponse(
        Long id,
        String name,
        String description,
        String factoryName,
        Double price,
        Double basePrice,
        Double discountRate,
        Double avgRating,
        Long totalSold,
        String stockStatus,  // "Còn hàng" | "Sắp hết" | "Hết hàng"
        String thumbnailUrl
) {}
