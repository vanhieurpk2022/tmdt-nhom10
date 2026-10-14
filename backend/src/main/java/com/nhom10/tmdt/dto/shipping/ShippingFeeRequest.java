package com.nhom10.tmdt.dto.shipping;

import jakarta.validation.constraints.NotNull;

import java.util.List;

public record ShippingFeeRequest(
        @NotNull(message = "Địa chỉ giao hàng không được để trống")
        Long addressId,

        List<Long> cartItemIds
) {
}
