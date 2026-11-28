package com.nhom10.tmdt.service.imp;

import com.nhom10.tmdt.enums.FactoryStatus;
import com.nhom10.tmdt.enums.ProductStatus;
import com.nhom10.tmdt.enums.ProductType;
import com.nhom10.tmdt.model.Factory;
import com.nhom10.tmdt.model.Product;
import com.nhom10.tmdt.model.ProductMil;
import jakarta.persistence.criteria.JoinType;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

/** Bản nháp chỉ được mở bán sau khi có ít nhất một biến thể có thể đặt mua. */
public final class ProductPublication {
    private ProductPublication() {}

    public static boolean isConfiguredVariant(ProductMil variant) {
        if (variant == null || !variant.isActive() || variant.getMil() <= 0 || variant.getStockQuantity() < 0) return false;
        Double price = variant.getBasePrice() != null ? variant.getBasePrice() : variant.getPrice();
        return price != null && Double.isFinite(price) && price > 0;
    }

    public static boolean isAvailableVariant(ProductMil variant) {
        return isConfiguredVariant(variant) && variant.getStockQuantity() > 0;
    }

    public static boolean isPublic(Product product) {
        if (product == null || product.getId() == null) return false;
        if (product.getProductType() != null && product.getProductType() != ProductType.NORMAL) return false;
        if (product.getStatus() != null && product.getStatus() != ProductStatus.ACTIVE) return false;
        if (product.getFactory() != null && product.getFactory().getFactoryStatus() != null
                && product.getFactory().getFactoryStatus() != FactoryStatus.ACTIVE) return false;
        // Giữ sản phẩm đã mở bán nhưng vừa bán hết hàng; không công khai sản phẩm chưa cấu hình.
        return product.getProductMils() != null
                && product.getProductMils().stream().anyMatch(ProductPublication::isConfiguredVariant);
    }

    public static Specification<Product> publicProducts() {
        return (root, query, cb) -> {
            var factory = root.<Product, Factory>join("factory", JoinType.LEFT);
            var variants = query.subquery(Integer.class);
            var variant = variants.from(ProductMil.class);
            variants.select(cb.literal(1)).where(
                    cb.equal(variant.get("product"), root), cb.isTrue(variant.get("isActive")),
                    cb.greaterThan(variant.get("mil"), 0), cb.ge(variant.get("stockQuantity"), 0),
                    cb.greaterThan(cb.coalesce(variant.<Double>get("basePrice"), variant.<Double>get("price")), 0.0));
            return cb.and(
                    cb.or(cb.isNull(root.get("productType")), cb.equal(root.get("productType"), ProductType.NORMAL)),
                    cb.or(cb.isNull(root.get("status")), cb.equal(root.get("status"), ProductStatus.ACTIVE)),
                    cb.or(cb.isNull(factory.get("factoryStatus")), cb.equal(factory.get("factoryStatus"), FactoryStatus.ACTIVE)),
                    cb.exists(variants));
        };
    }

    public static void requireReadyToPublish(Product product) {
        // Sản phẩm phối hương có luồng cấu hình riêng.
        if (product.getProductType() == ProductType.CUSTOM) return;
        if (product.getName() == null || product.getName().isBlank() || product.getCategory() == null) {
            throw badRequest("Vui lòng hoàn tất tên và danh mục trước khi mở bán");
        }
        if (product.getProductMils() == null || product.getProductMils().stream().noneMatch(ProductPublication::isAvailableVariant)) {
            throw badRequest("Chưa thể mở bán. Cần ít nhất một biến thể đang bật, có dung tích, giá hợp lệ và số lượng lớn hơn 0");
        }
    }

    public static void validateVariant(Integer mil, double price, double basePrice, int stock) {
        if (mil == null || mil <= 0) throw badRequest("Dung tích phải lớn hơn 0");
        if (!Double.isFinite(price) || price <= 0 || !Double.isFinite(basePrice) || basePrice <= 0) {
            throw badRequest("Giá bán và giá niêm yết phải lớn hơn 0");
        }
        if (stock < 0) throw badRequest("Số lượng tồn kho không được âm");
    }

    private static ResponseStatusException badRequest(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }
}
