package com.nhom10.tmdt.service.imp;

import com.nhom10.tmdt.enums.*;
import com.nhom10.tmdt.model.*;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class ProductPublicationTest {
    private Product product() {
        return Product.builder().id(1L).name("Tinh dầu mới").productType(ProductType.NORMAL)
                .status(ProductStatus.DRAFT).category(Category.builder().id(1L).build())
                .factory(Factory.builder().factoryStatus(FactoryStatus.ACTIVE).build())
                .productMils(List.of()).build();
    }

    private ProductMil variant(int stock) {
        return ProductMil.builder().mil(10).price(90000.0).basePrice(100000.0)
                .stockQuantity(stock).isActive(true).build();
    }

    @Test void draftStaysHiddenUntilConfiguredAndExplicitlyPublished() {
        Product product = product();
        assertFalse(ProductPublication.isPublic(product));
        assertThrows(ResponseStatusException.class, () -> ProductPublication.requireReadyToPublish(product));
        product.setProductMils(List.of(variant(5)));
        assertDoesNotThrow(() -> ProductPublication.requireReadyToPublish(product));
        assertFalse(ProductPublication.isPublic(product));
        product.setStatus(ProductStatus.ACTIVE);
        assertTrue(ProductPublication.isPublic(product));
    }

    @Test void oldActiveProductWithoutVariantsIsHidden() {
        Product product = product();
        product.setStatus(ProductStatus.ACTIVE);
        assertFalse(ProductPublication.isPublic(product));
        product.setStatus(null);
        assertFalse(ProductPublication.isPublic(product));
    }

    @Test void soldOutPublishedProductStaysVisibleButCannotBeNewlyPublished() {
        Product product = product();
        product.setStatus(ProductStatus.ACTIVE);
        product.setProductMils(List.of(variant(0)));
        assertTrue(ProductPublication.isPublic(product));
        assertFalse(RecommendationEligibility.isAvailable(product));
        assertThrows(ResponseStatusException.class, () -> ProductPublication.requireReadyToPublish(product));
    }

    @Test void disablingOrRemovingTheLastConfiguredVariantHidesProduct() {
        Product product = product();
        product.setStatus(ProductStatus.ACTIVE);
        ProductMil variant = variant(5);
        product.setProductMils(List.of(variant));
        assertTrue(ProductPublication.isPublic(product));
        variant.setActive(false);
        assertFalse(ProductPublication.isPublic(product));
        product.setProductMils(List.of());
        assertFalse(ProductPublication.isPublic(product));
    }

    @Test void zeroVolumeNonFinitePriceAndNegativeStockAreNotConfigured() {
        ProductMil variant = variant(5);
        variant.setMil(0);
        assertFalse(ProductPublication.isConfiguredVariant(variant));
        variant.setMil(10);
        for (double price : new double[]{0, -1, Double.NaN, Double.POSITIVE_INFINITY}) {
            variant.setBasePrice(price);
            assertFalse(ProductPublication.isConfiguredVariant(variant));
        }
        variant.setBasePrice(100000.0);
        variant.setStockQuantity(-1);
        assertFalse(ProductPublication.isConfiguredVariant(variant));
    }

    @Test void validatesVariantValuesAndAllowsZeroStockForInventoryUpdates() {
        assertDoesNotThrow(() -> ProductPublication.validateVariant(10, 90000, 100000, 0));
        assertThrows(ResponseStatusException.class, () -> ProductPublication.validateVariant(null, 90000, 100000, 1));
        assertThrows(ResponseStatusException.class, () -> ProductPublication.validateVariant(0, 90000, 100000, 1));
        assertThrows(ResponseStatusException.class, () -> ProductPublication.validateVariant(10, 0, 100000, 1));
        assertThrows(ResponseStatusException.class, () -> ProductPublication.validateVariant(10, 90000, Double.NaN, 1));
        assertThrows(ResponseStatusException.class, () -> ProductPublication.validateVariant(10, 90000, 100000, -1));
    }
}
