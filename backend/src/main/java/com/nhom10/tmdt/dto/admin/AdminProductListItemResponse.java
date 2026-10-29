package com.nhom10.tmdt.dto.admin;

import com.nhom10.tmdt.enums.ProductStatus;
import com.nhom10.tmdt.enums.ProductType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminProductListItemResponse {
    private Long id;
    private String code;
    private String name;
    private String description;
    private Long categoryId;
    private String categoryName;
    private ProductType productType;
    private ProductStatus status;
    private String thumbnailUrl;
    private Double price;
    private Double maxPrice;
    private Long totalStock;
    private Long totalSold;
    private Long views;
    private Double rating;
    private Integer reviewCount;
    private Integer variantCount;

    // Factory information
    private Long factoryId;
    private String factoryName;
    private String factoryAddress;
    private String factoryPhone;
    private String factoryRepresentative;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

