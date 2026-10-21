package com.nhom10.tmdt.dto.shipping;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.Valid;
import com.nhom10.tmdt.dto.order.BuyNowRequest;

import java.util.List;

public record ShippingFeeRequest(
        @NotNull(message = "Địa chỉ giao hàng không được để trống")
        Long addressId,

        List<Long> cartItemIds,

        @Valid BuyNowRequest buyNow
) {
}
