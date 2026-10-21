package com.nhom10.tmdt.dto.order;

public record OrderItemResponse(
        Long id,
        Long productId,
        String productName,
        String factoryName,
        String thumbnailUrl,
        int quantity,
        double unitPrice,
        double lineTotal,
        Long productMilId,
        Integer mil
) {
}
