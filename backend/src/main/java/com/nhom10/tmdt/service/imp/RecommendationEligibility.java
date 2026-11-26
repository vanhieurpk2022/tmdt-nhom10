package com.nhom10.tmdt.service.imp;

import com.nhom10.tmdt.enums.FactoryStatus;
import com.nhom10.tmdt.enums.ProductStatus;
import com.nhom10.tmdt.enums.ProductType;
import com.nhom10.tmdt.model.Product;
import com.nhom10.tmdt.model.ProductMil;

/** Điều kiện mở bán dùng chung cho cả hai loại gợi ý. */
final class RecommendationEligibility {
    private RecommendationEligibility() {}

    static boolean isAvailable(Product product) {
        if (product == null || product.getId() == null) return false;
        if (product.getProductType() != null && product.getProductType() != ProductType.NORMAL) return false;
        if (product.getStatus() != null && product.getStatus() != ProductStatus.ACTIVE) return false;
        if (product.getFactory() != null && product.getFactory().getFactoryStatus() != null
                && product.getFactory().getFactoryStatus() != FactoryStatus.ACTIVE) return false;
        if (product.getProductMils() == null) return false;

        return product.getProductMils().stream().anyMatch(RecommendationEligibility::isAvailableVariant);
    }

    static boolean isAvailableVariant(ProductMil variant) {
        if (variant == null || !variant.isActive() || variant.getStockQuantity() <= 0) return false;
        Double price = variant.getBasePrice() != null ? variant.getBasePrice() : variant.getPrice();
        return price != null && Double.isFinite(price) && price > 0;
    }
}
