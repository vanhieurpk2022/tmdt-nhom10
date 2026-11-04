package com.nhom10.tmdt.dto.customscent;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.util.List;

public record CreateCustomScentRequest(
        @NotNull @Positive Long factoryId,
        String name,
        @NotBlank String bottleType,
        String labelDesign,
        @NotNull @Positive @Max(2147483647) @Digits(integer = 10, fraction = 0) Double totalVolumeMl,
        @NotNull @PositiveOrZero Double price,
        String customNote,
        Integer quantity,
        @NotEmpty List<@NotNull @Valid ScentTierItemRequest> items
) {
    public CreateCustomScentRequest(
            Long factoryId,
            String bottleType,
            String labelDesign,
            Double totalVolumeMl,
            Double price,
            String customNote,
            Integer quantity,
            List<ScentTierItemRequest> items
    ) {
        this(factoryId, null, bottleType, labelDesign, totalVolumeMl, price, customNote, quantity, items);
    }

    public record ScentTierItemRequest(
            @NotNull @Positive Long productId,
            String scentName,
            @NotNull @Positive @Max(100) Double percentage,
            @NotNull @Positive Double volumeMl
    ) {}
}
