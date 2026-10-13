package com.nhom10.tmdt.dto.cart;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record AddCartItemRequest(
        @NotNull(message = "Sản phẩm không được để trống")
        Long productId,

        @Min(value = 1, message = "Số lượng phải lớn hơn 0")
        Integer quantity
) {
}
