package com.nhom10.tmdt.service.imp;

import com.nhom10.tmdt.model.Product;
import com.nhom10.tmdt.model.ProductMil;

/** Điều kiện mở bán dùng chung cho cả hai loại gợi ý. */
public final class RecommendationEligibility {
    private RecommendationEligibility() {}

    public static boolean isAvailable(Product product) {
        if (!isPublic(product)) return false;
        if (product.getProductMils() == null) return false;
        return product.getProductMils().stream().anyMatch(RecommendationEligibility::isAvailableVariant);
    }

    public static boolean isPublic(Product product) {
        return ProductPublication.isPublic(product);
    }

    public static boolean isAvailableVariant(ProductMil variant) {
        return ProductPublication.isAvailableVariant(variant);
    }
}
