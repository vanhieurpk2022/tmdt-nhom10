package com.nhom10.tmdt.dto.order;

import com.nhom10.tmdt.enums.PaymentMethod;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record CreateOrderRequest(
        @NotNull(message = "Địa chỉ giao hàng không được để trống")
        Long addressId,

        List<Long> cartItemIds,

        @NotNull(message = "Phương thức thanh toán không được để trống")
        PaymentMethod paymentMethod,

        @Size(max = 255, message = "Ghi chú không được vượt quá 255 ký tự")
        String note,

        @Valid BuyNowRequest buyNow,
        @Size(max = 32) String voucherCode
) {
    public CreateOrderRequest {
        voucherCode = voucherCode == null || voucherCode.isBlank() ? null : voucherCode.trim().toUpperCase(java.util.Locale.ROOT);
    }
    public CreateOrderRequest(Long addressId, List<Long> cartItemIds, PaymentMethod paymentMethod, String note, BuyNowRequest buyNow) {
        this(addressId, cartItemIds, paymentMethod, note, buyNow, null);
    }
}
