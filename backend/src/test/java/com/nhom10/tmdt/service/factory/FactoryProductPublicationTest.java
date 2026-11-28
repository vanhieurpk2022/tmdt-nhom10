package com.nhom10.tmdt.service.factory;

import com.nhom10.tmdt.dto.factory.*;
import com.nhom10.tmdt.dto.product.ProductCreateMilRequest;
import com.nhom10.tmdt.enums.*;
import com.nhom10.tmdt.model.*;
import com.nhom10.tmdt.repo.*;
import com.nhom10.tmdt.security.FactoryAccess;
import com.nhom10.tmdt.service.productmil.ProductMilServiceImp;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FactoryProductPublicationTest {
    @Mock FactoryAccess access;
    @Mock UserRepository users;
    @Mock CategoryRepository categories;
    @Mock ProductRepository products;
    @Mock ProductMilRepository variants;
    @Mock ProductImageRepository images;
    @InjectMocks FactoryDashboardServiceImp dashboard;

    @Test void creationIgnoresRequestedActiveStatusAndReturnsDraftIdForNextStep() {
        when(users.findByEmail("owner@example.invalid")).thenReturn(Optional.of(User.builder()
                .factory(Factory.builder().id(1L).build()).build()));
        when(categories.findById(1L)).thenReturn(Optional.of(Category.builder().id(1L).build()));
        when(products.save(any(Product.class))).thenAnswer(call -> {
            Product product = call.getArgument(0);
            product.setId(42L);
            return product;
        });
        var response = dashboard.createProduct(new FactoryProductModalRequest("Tinh dầu mới", 1L,
                ProductType.NORMAL, ProductStatus.ACTIVE, "Mô tả", new String[]{"/image.jpg"}), "owner@example.invalid");
        assertEquals(ProductStatus.DRAFT, response.status());
        assertEquals(42L, response.id());
    }

    @Test void publishingChecksCurrentVariantsAndStockWithoutChangingStatusOnFailure() {
        Product product = Product.builder().id(42L).name("Tinh dầu mới").category(Category.builder().id(1L).build())
                .productType(ProductType.NORMAL).status(ProductStatus.DRAFT).productMils(List.of()).build();
        when(products.findById(42L)).thenReturn(Optional.of(product));
        assertThrows(ResponseStatusException.class, () -> dashboard.changeStatusProducts(42L, new ChangeStatusProduct(ProductStatus.ACTIVE)));
        assertEquals(ProductStatus.DRAFT, product.getStatus());
        ProductMil variant = ProductMil.builder().mil(10).basePrice(100000.0).price(90000.0).stockQuantity(0).isActive(true).build();
        product.setProductMils(List.of(variant));
        assertThrows(ResponseStatusException.class, () -> dashboard.changeStatusProducts(42L, new ChangeStatusProduct(ProductStatus.ACTIVE)));
        variant.setStockQuantity(5);
        dashboard.changeStatusProducts(42L, new ChangeStatusProduct(ProductStatus.ACTIVE));
        assertEquals(ProductStatus.ACTIVE, product.getStatus());
        dashboard.changeStatusProducts(42L, new ChangeStatusProduct(ProductStatus.INACTIVE));
        assertEquals(ProductStatus.INACTIVE, product.getStatus());
    }

    @Test void bothVariantWritePathsRejectInvalidDataBeforeSaving() {
        Product product = Product.builder().id(42L).build();
        ProductMil variant = ProductMil.builder().id(7L).product(product).mil(10).price(90000.0).build();
        when(products.findById(42L)).thenReturn(Optional.of(product));
        when(products.getReferenceById(42L)).thenReturn(product);
        ProductMilServiceImp service = new ProductMilServiceImp(access, variants, products, images);
        assertThrows(ResponseStatusException.class, () -> service.createProductMil(42L, new ProductCreateMilRequest(10, 0, 100000, 5)));
        when(variants.findById(7L)).thenReturn(Optional.of(variant));
        assertThrows(ResponseStatusException.class, () -> dashboard.updateFactoryProductMil(7L, new FactoryVariantRequest(10, 90000, 100000, -1)));
        assertEquals(90000.0, variant.getPrice());
        verify(variants, never()).save(any());
    }
}
