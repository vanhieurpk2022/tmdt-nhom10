package com.nhom10.tmdt.rest;

import com.nhom10.tmdt.enums.*;
import com.nhom10.tmdt.model.*;
import com.nhom10.tmdt.repo.ProductRepository;
import com.nhom10.tmdt.service.imp.PurchaseItemService;
import org.junit.jupiter.api.Test;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class ChatbotCatalogControllerTest {
    private final ProductRepository products = mock(ProductRepository.class);
    private final PurchaseItemService purchases = mock(PurchaseItemService.class);
    private final ChatbotCatalogController controller = new ChatbotCatalogController(products, purchases);

    private Product product(long id, int stock) {
        Product product = Product.builder().id(id).name("Product " + id).productType(ProductType.NORMAL).status(ProductStatus.ACTIVE)
                .factory(Factory.builder().id(1L).name("Workshop").factoryStatus(FactoryStatus.ACTIVE).build()).build();
        product.setProductMils(List.of(ProductMil.builder().id(id * 10).product(product).mil(10).price(100000.0)
                .stockQuantity(stock).isActive(true).build()));
        return product;
    }

    @Test void defaultCatalogStillContainsOnlyOrderableProducts() {
        when(products.findAll()).thenReturn(List.of(product(1, 5), product(2, 0)));
        when(purchases.price(any(ProductMil.class))).thenAnswer(call -> ((ProductMil) call.getArgument(0)).getPrice());
        var catalog = controller.catalog(false).getData();
        assertEquals(List.of(1L), catalog.stream().map(ChatbotCatalogController.CatalogItem::id).toList());
    }

    @Test void statisticalCatalogIncludesSoldOutProductsAndTheirActualStock() {
        when(products.findAll()).thenReturn(List.of(product(1, 5), product(2, 0)));
        when(purchases.price(any(ProductMil.class))).thenAnswer(call -> ((ProductMil) call.getArgument(0)).getPrice());
        var catalog = controller.catalog(true).getData();
        assertEquals(2, catalog.size());
        assertEquals(0, catalog.getLast().variants().getFirst().stockQuantity());
    }

    @Test void statisticalCatalogDoesNotExposeInactiveFactoriesProductsOrCustomRecipes() {
        Product hiddenProduct = product(2, 5); hiddenProduct.setStatus(ProductStatus.INACTIVE);
        Product hiddenFactory = product(3, 5); hiddenFactory.getFactory().setFactoryStatus(FactoryStatus.SUSPENDED);
        Product custom = product(4, 5); custom.setProductType(ProductType.CUSTOM);
        when(products.findAll()).thenReturn(List.of(product(1, 5), hiddenProduct, hiddenFactory, custom));
        when(purchases.price(any(ProductMil.class))).thenAnswer(call -> ((ProductMil) call.getArgument(0)).getPrice());
        var catalog = controller.catalog(true).getData();
        assertEquals(List.of(1L), catalog.stream().map(ChatbotCatalogController.CatalogItem::id).toList());
    }
}
