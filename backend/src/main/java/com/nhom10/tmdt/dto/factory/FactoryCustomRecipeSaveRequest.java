package com.nhom10.tmdt.dto.factory;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record FactoryCustomRecipeSaveRequest(
        String bottleType,
        String labelDesign,
        String notes,
        List<Item> items
) {
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Item(
            Long productId,
            Double percentage,
            Double volumeMl,
            String note
    ) {}
}
