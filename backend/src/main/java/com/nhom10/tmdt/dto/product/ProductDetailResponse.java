package com.nhom10.tmdt.dto.product;

import java.util.List;

public record ProductDetailResponse(
        Long id,
        String name,
        String description,
        String categoryName,
        String factoryName,
        String factoryAddress,
        Double avgRating,
        Long totalSold,
        int reviewCount,
        Long totalStock,
        String stockStatus,
        List<String> imageUrls,
        List<ProductMilResponse> variants,
        List<ReviewResponse> reviews
) {}
