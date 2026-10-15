package com.nhom10.tmdt.dto.customscent;

public record ScentProductItem(
        Long id,
        String name,
        String description,
        Double price,
        Long factoryId,
        String factoryName,
        Integer tier
) {}

