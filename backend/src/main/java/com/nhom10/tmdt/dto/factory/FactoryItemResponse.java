package com.nhom10.tmdt.dto.factory;

import java.util.List;

public record FactoryItemResponse(
        Long id,
        String name,
        String address,
        String description,
        String factoryStatus,
        long productCount,
        String avatarUrl,
        String bannerUrl,
        List<String> galleryImages,
        Double minPrice,
        Double maxPrice
) {}
