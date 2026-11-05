package com.nhom10.tmdt.rest;

import com.nhom10.tmdt.dto.cart.AddCartItemRequest;
import com.nhom10.tmdt.dto.cart.CartResponse;
import com.nhom10.tmdt.dto.customscent.CreateCustomScentRequest;
import com.nhom10.tmdt.dto.customscent.CreateCustomScentRequest.ScentTierItemRequest;
import com.nhom10.tmdt.enums.ProductStatus;
import com.nhom10.tmdt.enums.ProductType;
import com.nhom10.tmdt.model.*;
import com.nhom10.tmdt.repo.*;
import com.nhom10.tmdt.service.imp.CartService;
import jakarta.validation.Validation;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CustomScentControllerTest {
    @Mock ProductRepository productRepo;
    @Mock FactoryRepository factoryRepo;
    @Mock CategoryRepository categoryRepo;
    @Mock ProductMilRepository productMilRepo;
    @Mock ProductImageRepository productImageRepo;
    @Mock ProductCustomRepository productCustomRepo;
    @Mock ProductCustomItemRepository productCustomItemRepo;
    @Mock UserRepository userRepo;
    @Mock CartService cartService;
    @InjectMocks CustomScentController controller;

    private final Factory factory = Factory.builder().id(1L).name("Xưởng thử nghiệm").build();
    private final User customer = User.builder().id(7L).email("customer@example.com").build();
    private UserDetails principal;

    @BeforeEach
    void setUp() {
        principal = org.springframework.security.core.userdetails.User
                .withUsername(customer.getEmail()).password("unused").authorities("ROLE_USER").build();
    }

    private Product ingredient(long id) {
        return Product.builder().id(id).name("Tinh dầu " + id).factory(factory)
                .productType(ProductType.NORMAL).status(ProductStatus.ACTIVE).price(100000.0).build();
    }

    private CreateCustomScentRequest request(List<ScentTierItemRequest> items) {
        return new CreateCustomScentRequest(1L, "Hổ Phách Hoàng Gia", "1", 30.0,
                545000.0, "Khắc tên An Nhiên", 2, items);
    }

    private CreateCustomScentRequest validRequest() {
        return request(List.of(
                new ScentTierItemRequest(10L, "Tên từ client", 30.0, 9.0),
                new ScentTierItemRequest(11L, null, 50.0, 15.0),
                new ScentTierItemRequest(12L, null, 20.0, 6.0)));
    }

    private void stubCustomerAndFactory() {
        when(userRepo.findByEmail(customer.getEmail())).thenReturn(Optional.of(customer));
        when(factoryRepo.findById(1L)).thenReturn(Optional.of(factory));
    }

    private void stubCreation() {
        stubCustomerAndFactory();
        for (long id = 10; id <= 12; id++) {
            when(productRepo.findById(id)).thenReturn(Optional.of(ingredient(id)));
        }
        when(productCustomRepo.save(any())).thenAnswer(call -> {
            ProductCustom recipe = call.getArgument(0);
            recipe.setId(20L);
            return recipe;
        });
        when(productRepo.save(any())).thenAnswer(call -> {
            Product product = call.getArgument(0);
            product.setId(30L);
            return product;
        });
        when(productMilRepo.saveAndFlush(any())).thenAnswer(call -> {
            ProductMil variant = call.getArgument(0);
            variant.setId(40L);
            return variant;
        });
    }

    @Test
    void buyNowCombinesItemsIntoOneLinkedCustomProduct() {
        stubCreation();
        var response = controller.createCustomProduct(validRequest(), principal).getBody().getData();

        ArgumentCaptor<Product> productCaptor = ArgumentCaptor.forClass(Product.class);
        verify(productRepo, times(1)).save(productCaptor.capture());
        Product product = productCaptor.getValue();
        ProductCustom recipe = product.getProductCustom();
        assertEquals(ProductType.CUSTOM, product.getProductType());
        assertNotNull(recipe);
        assertSame(customer, recipe.getUser());
        assertEquals(product.getName(), recipe.getName());
        assertEquals("Khắc tên An Nhiên", recipe.getNotes());
        assertEquals(30.0, recipe.getTotalVolumeMl());
        assertEquals(545000.0, recipe.getPrice());
        assertEquals("Hổ Phách Hoàng Gia", recipe.getBottleType());
        assertEquals("1", recipe.getLabelDesign());
        assertEquals(3, recipe.getItems().size());
        assertEquals(List.of(10L, 11L, 12L), recipe.getItems().stream().map(i -> i.getProduct().getId()).toList());
        assertEquals(List.of(30.0, 50.0, 20.0), recipe.getItems().stream().map(ProductCustomItem::getPercentage).toList());
        assertEquals(List.of(9.0, 15.0, 6.0), recipe.getItems().stream().map(ProductCustomItem::getVolumeM1).toList());
        recipe.getItems().forEach(item -> assertSame(recipe, item.getProductCustom()));
        verify(productCustomItemRepo).saveAll(recipe.getItems());
        assertEquals(30L, response.productId());
        assertEquals(40L, response.productMilId());
        assertEquals(20L, response.productCustomId());
        assertEquals(2, response.quantity());
        assertFalse(product.getDescription().contains("Tên từ client"));
    }

    @Test
    void addToCartUsesTheCombinedProductAndVariant() {
        stubCreation();
        CartResponse cart = new CartResponse(1L, List.of(), 0, 0.0, 0.0);
        when(cartService.addItem(eq(customer.getEmail()), any())).thenReturn(cart);

        assertSame(cart, controller.addCustomScentToCart(validRequest(), principal).getBody().getData());
        verify(cartService).addItem(customer.getEmail(), new AddCartItemRequest(30L, 2, 40L));
        verify(productRepo, times(1)).save(any());
    }

    @Test
    void scentChoicesExcludeCompletedCustomProductsAndInactiveIngredients() {
        when(factoryRepo.findById(1L)).thenReturn(Optional.of(factory));
        Product blended = ingredient(11L);
        blended.setProductType(ProductType.CUSTOM);
        Product inactive = ingredient(12L);
        inactive.setStatus(ProductStatus.INACTIVE);
        Product legacyIngredient = ingredient(13L);
        legacyIngredient.setStatus(null);
        when(productRepo.findByFactoryId(1L)).thenReturn(List.of(ingredient(10L), blended, inactive, legacyIngredient));

        var scents = controller.getScentsByFactory(1L).getBody().getData();
        assertEquals(2, scents.size());
        assertEquals(10L, scents.getFirst().id());
        assertEquals(13L, scents.getLast().id());
    }

    @Test
    void invalidPercentageTotalDoesNotPersistPartialRecipe() {
        stubCustomerAndFactory();
        when(productRepo.findById(10L)).thenReturn(Optional.of(ingredient(10L)));
        var invalid = request(List.of(new ScentTierItemRequest(10L, null, 30.0, 9.0)));

        assertEquals(400, assertThrows(ResponseStatusException.class,
                () -> controller.createCustomProduct(invalid, principal)).getStatusCode().value());
        verifyNoInteractions(productCustomRepo, productCustomItemRepo, productMilRepo);
        verify(productRepo, never()).save(any());
    }

    @Test
    void missingIngredientDoesNotSilentlyCreateIncompleteProduct() {
        stubCustomerAndFactory();
        when(productRepo.findById(10L)).thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class, () -> controller.createCustomProduct(validRequest(), principal));
        verifyNoInteractions(productCustomRepo, productCustomItemRepo, productMilRepo);
        verify(productRepo, never()).save(any());
    }

    @Test
    void rejectsIngredientsFromAnotherFactoryAndCompletedCustomProducts() {
        stubCustomerAndFactory();
        Product otherFactory = ingredient(10L);
        otherFactory.setFactory(Factory.builder().id(2L).build());
        when(productRepo.findById(10L)).thenReturn(Optional.of(otherFactory));
        assertThrows(ResponseStatusException.class, () -> controller.createCustomProduct(validRequest(), principal));

        Product blended = ingredient(10L);
        blended.setProductType(ProductType.CUSTOM);
        when(productRepo.findById(10L)).thenReturn(Optional.of(blended));
        assertThrows(ResponseStatusException.class, () -> controller.createCustomProduct(validRequest(), principal));
        verifyNoInteractions(productCustomRepo, productCustomItemRepo, productMilRepo);
    }

    @Test
    void rejectsMismatchedComponentVolumeBeforeSaving() {
        stubCustomerAndFactory();
        when(productRepo.findById(10L)).thenReturn(Optional.of(ingredient(10L)));
        var invalid = request(List.of(new ScentTierItemRequest(10L, null, 100.0, 9.0)));
        assertThrows(ResponseStatusException.class, () -> controller.createCustomProduct(invalid, principal));
        verifyNoInteractions(productCustomRepo, productCustomItemRepo, productMilRepo);
    }

    @Test
    void anonymousCreationDoesNotPersistAnOwnerlessRecipe() {
        assertEquals(401, assertThrows(ResponseStatusException.class,
                () -> controller.createCustomProduct(validRequest(), null)).getStatusCode().value());
        verifyNoInteractions(userRepo, productRepo, productCustomRepo, productCustomItemRepo);
    }

    @Test
    void validatesRequiredRecipeItemsAndTheirFields() {
        try (var factory = Validation.buildDefaultValidatorFactory()) {
            var validator = factory.getValidator();
            assertTrue(validator.validate(validRequest()).isEmpty());
            assertFalse(validator.validate(request(List.of())).isEmpty());
            assertFalse(validator.validate(request(List.of(new ScentTierItemRequest(null, null, null, null)))).isEmpty());
        }
    }
}
