package com.nhom10.tmdt.dto.shipping;

public record ShippingFeeResponse(
        Long addressId,
        int shippingFee,
        String provider,
        String message
) {
}
