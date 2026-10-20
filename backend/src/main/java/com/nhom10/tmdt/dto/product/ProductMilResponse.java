package com.nhom10.tmdt.dto.product;

public record ProductMilResponse(
        Long id,
        int mil,
        Double price,
        int stockQuantity,
        boolean isActive
) {}
