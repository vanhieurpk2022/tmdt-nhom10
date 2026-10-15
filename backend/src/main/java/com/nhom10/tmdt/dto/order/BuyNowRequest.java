package com.nhom10.tmdt.dto.order;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record BuyNowRequest(
        @NotNull @Positive Long productId,
        @Positive Long productMilId,
        @NotNull @Min(1) Integer quantity
) {
}
