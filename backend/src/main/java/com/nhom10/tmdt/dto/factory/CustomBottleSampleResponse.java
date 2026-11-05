package com.nhom10.tmdt.dto.factory;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomBottleSampleResponse {
    private Long id;
    private String imageUrl;
    private boolean isCustomSample;
    private boolean isThumbnail;
    private Long productId;
    private String productName;
    private LocalDateTime uploadedAt;
}

