package com.nhom10.tmdt.dto.product;

import lombok.Builder;

@Builder
public record ProductCreateMilRequest(
        int mil,
        double price,
        double basePrice,
        int stockQuantity,
        boolean isActive,
        String imageUrl
) {
}
