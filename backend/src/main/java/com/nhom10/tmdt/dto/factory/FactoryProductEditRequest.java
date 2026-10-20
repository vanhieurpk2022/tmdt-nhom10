package com.nhom10.tmdt.dto.factory;

import com.nhom10.tmdt.enums.ProductType;

public record FactoryProductEditRequest(
        Long id,
        String name,
        String category,
        ProductType type,
        String description,
        String[] imageUrls
) {
}
