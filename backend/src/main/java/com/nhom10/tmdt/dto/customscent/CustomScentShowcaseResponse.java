package com.nhom10.tmdt.dto.customscent;

import java.util.List;

public record CustomScentShowcaseResponse(
        List<CustomScentCardDto> topSelling,
        List<CustomScentCardDto> userCreations
) {
    public record CustomScentCardDto(
            Long id,
            Long productCustomId,
            String name,
            String ingredientsText,
            Long factoryId,
            String factoryName,
            String creatorName,
            Double price,
            String imageUrl,
            Long totalSold,
            Long reviewCount,
            Double averageRating
    ) {}
}

