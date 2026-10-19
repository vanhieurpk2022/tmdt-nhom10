package com.nhom10.tmdt.dto.factory;

import com.nhom10.tmdt.enums.ProductStatus;
import com.nhom10.tmdt.enums.ProductType;

import java.time.LocalDateTime;

public record FactoryProductItem(
        Long id,
        String name,
        Long  stock,
        Long  sold,
        ProductStatus status,
        ProductType type,
        LocalDateTime createdAt,
        String category,
        String thumbnailUrl) {}
