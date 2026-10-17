package com.nhom10.tmdt.dto.product;

import lombok.Builder;

@Builder
public record ProductCreateMilResponse
    (Long id,
    int mil,
    double price,
    double basePrice,
    int stockQuantity,
    boolean isActive,
    String imageUrl){
}
