package com.nhom10.tmdt.service.imp;

import com.nhom10.tmdt.enums.FactoryStatus;
import com.nhom10.tmdt.enums.ProductStatus;
import com.nhom10.tmdt.enums.ProductType;
import com.nhom10.tmdt.model.Category;
import com.nhom10.tmdt.model.Factory;
import com.nhom10.tmdt.model.Product;
import com.nhom10.tmdt.model.ProductMil;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class ProductRecommendationServiceTest {
    private final ProductRecommendationService service = new ProductRecommendationService();

    @Test
    void matchingScentBeatsAnUnrelatedProductFromTheSameFactory() {
        Product target = product(1, "Tinh dầu Oải Hương");
        Product unrelated = product(2, "Tinh dầu Quế");
        Product matching = product(3, "Tinh dầu Oải Hương Pháp");
        matching.setFactory(Factory.builder().id(2L).name("Xưởng khác").factoryStatus(FactoryStatus.ACTIVE).build());

        assertEquals(List.of(3L), ids(service.findSimilarProducts(target, List.of(unrelated, matching), 4)));
    }

    @Test
    void ignoresRecoveryWordsInTheDescriptionWhenRecognizingCarrierOil() {
        Product target = product(1, "Dầu Hạnh Nhân");
        target.setDescription("Hỗ trợ phục hồi da, có thể phối với tinh dầu hồi.");
        Product matching = product(2, "Dầu Hạnh Nhân Nguyên Chất");
        Product anise = product(3, "Tinh dầu Hồi");

        assertEquals(List.of(2L), ids(service.findSimilarProducts(target, List.of(anise, matching), 4)));
    }

    @Test
    void recognizesResinFamilyAcrossVietnameseAndEnglishNames() {
        Product target = product(1, "Tinh dầu Nhũ Hương");
        Product frankincense = product(2, "Frankincense");
        Product citrus = product(3, "Tinh dầu Quýt");

        assertEquals(List.of(2L), ids(service.findSimilarProducts(target, List.of(citrus, frankincense), 4)));
    }

    @Test
    void ranksTheWholeFragranceNameAheadOfAnOverlappingShorterName() {
        Product target = product(1, "Tinh dầu Sả Hoa Hồng");
        Product exact = product(2, "Sả Hoa Hồng");
        Product rose = product(3, "Tinh dầu Hoa Hồng");

        assertEquals(2L, service.findSimilarProducts(target, List.of(rose, exact), 4).getFirst().getId());
    }

    @Test
    void excludesTheTargetAndProductsThatCannotBePurchased() {
        Product target = product(1, "Tinh dầu Bạc Hà");
        Product available = product(2, "Tinh dầu Bạc Hà");
        Product hidden = product(3, "Tinh dầu Bạc Hà");
        hidden.setStatus(ProductStatus.INACTIVE);
        Product custom = product(4, "Tinh dầu Bạc Hà");
        custom.setProductType(ProductType.CUSTOM);
        Product noVariants = product(5, "Tinh dầu Bạc Hà");
        noVariants.setProductMils(List.of());
        Product noStock = product(6, "Tinh dầu Bạc Hà");
        noStock.getProductMils().getFirst().setStockQuantity(0);
        Product inactiveVariant = product(7, "Tinh dầu Bạc Hà");
        inactiveVariant.getProductMils().getFirst().setActive(false);
        Product invalidPrice = product(8, "Tinh dầu Bạc Hà");
        invalidPrice.getProductMils().getFirst().setBasePrice(0.0);
        Product closedFactory = product(9, "Tinh dầu Bạc Hà");
        closedFactory.getFactory().setFactoryStatus(FactoryStatus.CLOSED);

        List<Product> result = service.findSimilarProducts(target,
                List.of(target, available, hidden, custom, noVariants, noStock, inactiveVariant, invalidPrice, closedFactory), 12);

        assertEquals(List.of(2L), ids(result));
    }

    @Test
    void matchingOnlyTheCategoryAndVolumeIsNotEnough() {
        Product target = product(1, "Sản phẩm Alpha");
        Product unrelated = product(2, "Mặt hàng Beta");

        assertTrue(service.findSimilarProducts(target, List.of(unrelated), 4).isEmpty());
    }

    @Test
    void canSuggestAvailableAlternativesForAnOutOfStockTarget() {
        Product target = product(1, "Tinh dầu Bạc Hà");
        target.getProductMils().getFirst().setStockQuantity(0);
        Product available = product(2, "Tinh dầu Bạc Hà");

        assertEquals(List.of(2L), ids(service.findSimilarProducts(target, List.of(target, available), 4)));
    }

    @Test
    void breaksEqualScoresByIdAndHonorsTheLimit() {
        Product target = product(1, "Tinh dầu Bạc Hà");
        assertEquals(List.of(3L), ids(service.findSimilarProducts(target,
                List.of(product(5, "Tinh dầu Bạc Hà"), product(3, "Tinh dầu Bạc Hà")), 1)));
        assertTrue(service.findSimilarProducts(target, List.of(product(2, "Tinh dầu Bạc Hà")), 0).isEmpty());
    }

    private List<Long> ids(List<Product> products) {
        return products.stream().map(Product::getId).toList();
    }

    static Product product(long id, String name) {
        return Product.builder().id(id).name(name).productType(ProductType.NORMAL).status(ProductStatus.ACTIVE)
                .category(Category.builder().id(1L).name("Tinh dầu").build())
                .factory(Factory.builder().id(1L).name("Xưởng thử nghiệm").factoryStatus(FactoryStatus.ACTIVE).build())
                .productMils(List.of(ProductMil.builder().mil(10).basePrice(100000.0)
                        .stockQuantity(10).isActive(true).build()))
                .build();
    }
}
