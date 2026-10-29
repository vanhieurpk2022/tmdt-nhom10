package com.nhom10.tmdt.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminProductVariantDto {
    private Long id;
    private Integer mil;
    private Double price;
    private Double basePrice;
    private Integer stock;
    private Long sold;
    private String sku;
    private Boolean isActive;
}

