package com.nhom10.tmdt.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminProductComponentDto {
    private Long productId;
    private String productName;
    private Double percentage;
    private Double oilVolumeMl;
    private String note;
}

