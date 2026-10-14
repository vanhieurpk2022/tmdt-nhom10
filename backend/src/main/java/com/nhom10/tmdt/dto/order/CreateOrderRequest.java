package com.nhom10.tmdt.dto.order;

import com.nhom10.tmdt.enums.PaymentMethod;
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
        String note
) {
}
