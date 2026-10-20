package com.nhom10.tmdt.dto.product;

import lombok.Builder;

@Builder
public record ToggleMilStatusResponse(
        int mil,
        double price,
        double basePrice,
        int stockQuantity,
        boolean isActive
) {
}
