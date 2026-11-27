package com.nhom10.tmdt.dto.factory;

import lombok.Builder;
import java.time.LocalDateTime;

@Builder
public record FactoryProfileDto(
        Long id,
        String code,
        String name,
        String owner,
        String email,
        String phone,
        String address,
        String description,
        String status,
        Double rating,
        Long ratingCount,
        Long totalOrders,
        Long totalProducts,
        LocalDateTime joinedAt,
        String taxCode,
        String businessLicense,
        String website,
        String avatarUrl,
        boolean kycVerified
) {}

