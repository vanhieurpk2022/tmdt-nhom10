package com.nhom10.tmdt.service.admin;

import com.nhom10.tmdt.dto.admin.*;
import com.nhom10.tmdt.enums.ProductStatus;
import com.nhom10.tmdt.enums.ProductType;

public interface AdminProductService {

    AdminProductPageResponse getProducts(
            int page,
            int size,
            String search,
            Long factoryId,
            Long categoryId,
            ProductType productType,
            ProductStatus status,
            String sortBy,
            String sortDir
    );

    AdminProductStatsResponse getProductStats();

    AdminProductDetailResponse getProductDetail(Long id);

    AdminProductDetailResponse updateProductStatus(Long id, UpdateProductStatusRequest request);

    void deleteProduct(Long id);
}

