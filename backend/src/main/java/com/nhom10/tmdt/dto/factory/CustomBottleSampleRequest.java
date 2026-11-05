package com.nhom10.tmdt.dto.factory;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomBottleSampleRequest {
    private String imageUrl;
    private Long productId;
    private String name;
}

