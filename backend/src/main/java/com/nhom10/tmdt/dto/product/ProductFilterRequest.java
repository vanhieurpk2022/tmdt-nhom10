package com.nhom10.tmdt.dto.product;

import java.util.List;

public record ProductFilterRequest(
        List<Long> categoryIds,
        List<Long> factoryIds,
        Double minPrice,
        Double maxPrice,
        Integer minRating,
        String sort,      // "popular" | "newest" | "price-asc" | "price-desc" | "bestseller"
        int page,
        int size
) {
    public ProductFilterRequest {
        if (page < 0) page = 0;
        if (size <= 0 || size > 50) size = 12;
        if (sort == null || sort.isBlank()) sort = "popular";
    }
}
