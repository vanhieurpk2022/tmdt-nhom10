package com.nhom10.tmdt.dto.admin;

import com.nhom10.tmdt.enums.ProductStatus;
import com.nhom10.tmdt.enums.ProductType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminProductDetailResponse {
    private Long id;
    private String code;
    private String name;
    private String description;
    private Long categoryId;
    private String categoryName;
    private ProductType productType;
    private ProductStatus status;
    private String thumbnailUrl;
    private List<String> images;
    private Double price;
    private Double maxPrice;
    private Long totalStock;
    private Long totalSold;
    private Long views;
    private Double rating;
    private Integer reviewCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Factory information
    private Long factoryId;
    private String factoryName;
    private String factoryAddress;
    private String factoryPhone;
    private String factoryEmail;
    private String factoryRepresentative;
    private String factoryStatus;
    private String licenseUrl;
    private String cosmeticLicenseUrl;

    // Variants (ProductMil)
    private List<AdminProductVariantDto> variants;

    // Fragrance Notes & Formula (ProductCustom)
    private AdminFragranceNotesDto fragranceNotes;
    private List<AdminProductComponentDto> components;
    private String bottleType;
    private String labelDesign;
    private Double totalVolumeMl;
    private String formulaNotes;
}

