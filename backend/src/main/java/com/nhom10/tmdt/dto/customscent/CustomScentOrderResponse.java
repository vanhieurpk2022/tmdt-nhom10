package com.nhom10.tmdt.dto.customscent;

public record CustomScentOrderResponse(
        Long productId,
        Long productMilId,
        Long productCustomId,
        String name,
        Double price,
        Integer quantity
) {}
