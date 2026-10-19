package com.nhom10.tmdt.dto.cart;

import java.util.List;

public record CartResponse(
        Long cartId,
        List<CartItemResponse> items,
        Integer totalItems,
        Double subtotal,
        Double total
) {
}
