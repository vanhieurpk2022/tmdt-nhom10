package com.nhom10.tmdt.dto.customscent;

import java.util.List;

public record CustomScentDetailResponse(
        Long id,
        Long productId,
        String name,
        Long factoryId,
        String factoryName,
        String bottleType,
        String labelDesign,
        Double totalVolumeMl,
        Double price,
        String notes,
        String creatorName,
        List<CustomScentDetailItemDto> items
) {
    public record CustomScentDetailItemDto(
            Long productId,
            String productName,
            Double volumeMl,
            Double percentage,
            Double price
    ) {}
}

