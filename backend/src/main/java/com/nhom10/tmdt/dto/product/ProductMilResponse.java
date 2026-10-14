package com.nhom10.tmdt.dto.product;

public record ProductMilResponse(
        Long id,
        int mil,
        Double price,
        Double basePrice,
        int stockQuantity,
        boolean isActive
) {}
