package com.nhom10.tmdt.dto.factory;

public record FactoryVariantRes(   Long id,
        String productName,
        Integer mil,
        double price,
        double basePrice,
        int stockQuantity,
        boolean isActive) {
}
