package com.nhom10.tmdt.dto.factory;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.nhom10.tmdt.enums.ProductType;

@JsonIgnoreProperties(ignoreUnknown = true)
public record FactoryProductEditRequest(
        Long id,
        String name,
        String category,
        ProductType type,
        String description,
        String[] imageUrls
) {
}
