package com.nhom10.tmdt.dto.customscent;

import java.util.List;

public record CreateCustomScentRequest(
        Long factoryId,
        String bottleType,
        String labelDesign,
        Double totalVolumeMl,
        Double price,
        String customNote,
        Integer quantity,
        List<ScentTierItemRequest> items
) {
    public record ScentTierItemRequest(
            Long productId,
            String scentName,
            Double percentage,
            Double volumeMl
    ) {}
}

