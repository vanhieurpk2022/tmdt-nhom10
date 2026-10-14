package com.nhom10.tmdt.dto.product;

import java.util.List;

public record ProductPageResponse(
        List<ProductCardResponse> products,
        long totalElements,
        int totalPages,
        int currentPage
) {}
