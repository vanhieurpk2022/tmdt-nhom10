package com.nhom10.tmdt.service.imp;

import com.nhom10.tmdt.dto.customscent.CreateCustomScentRequest;
import com.nhom10.tmdt.model.*;
import com.nhom10.tmdt.enums.*;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;

class CustomScentPricingTest {
    private final CustomScentPricing pricing = new CustomScentPricing();
    private Product ingredient() {
        var factory = Factory.builder().id(1L).factoryStatus(FactoryStatus.ACTIVE).build();
        var product = Product.builder().id(1L).factory(factory).productType(ProductType.NORMAL).status(ProductStatus.ACTIVE).build();
        product.setProductMils(List.of(ProductMil.builder().id(2L).product(product).mil(10).price(100000.0).isActive(true).stockQuantity(10).build()));
        return product;
    }
    private CreateCustomScentRequest request(double clientPrice) {
        return new CreateCustomScentRequest(1L, "Chai", null, 30.0, clientPrice, null, 1,
                List.of(new CreateCustomScentRequest.ScentTierItemRequest(1L, null, 100.0, 30.0)));
    }
    @Test void ignoresClientPriceAndCalculatesFromActualVariants() {
        var quote = pricing.quote(List.of(ingredient()), request(1));
        assertEquals(335000, quote.price());
        assertEquals(3, quote.stockQuantity());
    }
    @Test void refusesUnavailableIngredients() {
        var ingredient = ingredient();
        ingredient.getProductMils().getFirst().setStockQuantity(0);
        assertThrows(ResponseStatusException.class, () -> pricing.quote(List.of(ingredient), request(1)));
    }
    @Test void refusesIngredientsFromAnotherFactory() {
        var ingredient = ingredient();
        ingredient.getFactory().setId(9L);
        assertThrows(ResponseStatusException.class, () -> pricing.quote(List.of(ingredient), request(1)));
    }
    @Test void roundsInventoryUpToWholeBottles() {
        assertEquals(1, CustomScentPricing.bottles(9, 10));
        assertEquals(2, CustomScentPricing.bottles(15, 10));
        assertThrows(ResponseStatusException.class, () -> CustomScentPricing.bottles(Double.NaN, 10));
    }
    @Test void choosesLowestWholeBottleCostInsteadOfLowestPricePerMl() {
        var product = ingredient();
        var small = product.getProductMils().getFirst();
        var large = ProductMil.builder().id(3L).product(product).mil(50).price(250000.0).stockQuantity(10).isActive(true).build();
        product.setProductMils(List.of(small, large));
        var smallRequest = new CreateCustomScentRequest(1L, "Chai", null, 5.0, 0.0, null, 1,
                List.of(new CreateCustomScentRequest.ScentTierItemRequest(1L, null, 100.0, 5.0)));
        assertEquals(135000, pricing.quote(List.of(product), smallRequest).price());
        assertEquals(285000, pricing.quote(List.of(product), request(0)).price());
    }
    @Test void choosesAnAvailableLargerBottleWhenSmallerVariantCannotCoverRecipe() {
        var product = ingredient();
        product.getProductMils().getFirst().setStockQuantity(1);
        var large = ProductMil.builder().id(3L).product(product).mil(50).price(500000.0).stockQuantity(1).isActive(true).build();
        product.setProductMils(List.of(product.getProductMils().getFirst(), large));
        assertEquals(535000, pricing.quote(List.of(product), request(0)).price());
    }
}
