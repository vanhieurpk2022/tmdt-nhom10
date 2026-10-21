package com.nhom10.tmdt.dto.product;

import java.time.LocalDateTime;

public record ReviewResponse(
        Long id,
        int rating,
        String comment,
        String reviewerName,
        LocalDateTime createdAt
) {}
