package com.nhom10.tmdt.dto.factory;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.nhom10.tmdt.enums.ProductStatus;
import com.nhom10.tmdt.enums.ProductType;

@JsonIgnoreProperties(ignoreUnknown = true)
public record FactoryProductModalRequest(
        String name,
        Long categoryId,
        ProductType type,
        ProductStatus status,
        String description,
        String[] imageUrls) {
}
