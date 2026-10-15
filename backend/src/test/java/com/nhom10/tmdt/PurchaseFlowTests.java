package com.nhom10.tmdt;

import com.nhom10.tmdt.dto.cart.AddCartItemRequest;
import com.nhom10.tmdt.dto.order.BuyNowRequest;
import com.nhom10.tmdt.dto.order.CreateOrderRequest;
import com.nhom10.tmdt.enums.PaymentMethod;
import com.nhom10.tmdt.model.*;
import com.nhom10.tmdt.repo.*;
import com.nhom10.tmdt.service.imp.CartService;
import com.nhom10.tmdt.service.imp.OrderService;
import com.nhom10.tmdt.service.imp.PurchaseItemService;
import com.nhom10.tmdt.service.shipping.ShippingFeeService;
import com.nhom10.tmdt.service.shipping.GhnShippingClient;
import com.nhom10.tmdt.service.shipping.GhnLocationResolver;
import com.nhom10.tmdt.config.GhnShippingProperties;
import com.nhom10.tmdt.dto.shipping.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class PurchaseFlowTests {
    private final ProductRepository products = mock(ProductRepository.class);
    private final CartRepository carts = mock(CartRepository.class);
    private final CartItemRepository cartItems = mock(CartItemRepository.class);
    private final UserRepository users = mock(UserRepository.class);
    private final AddressRepository addresses = mock(AddressRepository.class);
    private final OrderRepository orders = mock(OrderRepository.class);
    private final OrderItemRepository orderItems = mock(OrderItemRepository.class);
    private final ShippingFeeService shipping = mock(ShippingFeeService.class);
    private final PurchaseItemService purchases = new PurchaseItemService(products, carts, cartItems);
    private final CartService cartService = new CartService(carts, cartItems, users, purchases);
    private final OrderService orderService = new OrderService(cartItems, addresses, orders, orderItems, shipping, purchases);
    private Product product;
    private ProductMil small;
    private ProductMil large;
    private Cart cart;
    private Address address;

    @BeforeEach
    void setup() {
        product = Product.builder().id(3L).name("Tinh dầu Cam Ngọt").price(190000.0).build();
        small = ProductMil.builder().id(31L).product(product).mil(10).price(190000.0)
                .basePrice(220000.0).stockQuantity(20).isActive(true).build();
        large = ProductMil.builder().id(32L).product(product).mil(50).price(700000.0)
                .basePrice(770000.0).stockQuantity(5).isActive(true).build();
        product.setProductMils(List.of(large, small));
        cart = Cart.builder().id(1L).user(User.builder().id(1L).build()).build();
        address = Address.builder().id(2L).user(cart.getUser()).recipentName("Khách hàng")
                .phoneNumber("0900000000").street("Đường A").city("Hồ Chí Minh").build();
        when(products.findById(3L)).thenReturn(Optional.of(product));
    }

    @Test
    void previewUsesSelectedVolumeAndQuantityInsteadOfProductMinimumPrice() {
        var result = purchases.preview(new BuyNowRequest(3L, 32L, 2));
        assertEquals(32L, result.productMilId());
        assertEquals(50, result.mil());
        assertEquals(700000.0, result.price());
        assertEquals(1400000.0, result.lineTotal());
        verifyNoInteractions(carts, cartItems);
    }

    @Test
    void listingDefaultsToCheapestActiveVariant() {
        var result = purchases.preview(new BuyNowRequest(3L, null, 1));
        assertEquals(31L, result.productMilId());
        assertEquals(190000.0, result.lineTotal());
    }

    @Test
    void previewRejectsWrongVolumeInactiveVolumeAndInsufficientStock() {
        assertThrows(ResponseStatusException.class, () -> purchases.preview(new BuyNowRequest(3L, 99L, 1)));
        assertThrows(ResponseStatusException.class, () -> purchases.preview(new BuyNowRequest(3L, 32L, 6)));
        assertThrows(ResponseStatusException.class, () -> purchases.preview(new BuyNowRequest(3L, 32L, 0)));
        large.setActive(false);
        assertThrows(ResponseStatusException.class, () -> purchases.preview(new BuyNowRequest(3L, 32L, 1)));
    }

    @Test
    void addToCartMergesOnlyTheSameVolume() {
        CartItem existing = CartItem.builder().id(10L).cart(cart).product(product).productMil(small).quantity(2).build();
        var storedItems = new ArrayList<>(List.of(existing));
        when(carts.findByUserEmail("buyer")).thenReturn(Optional.of(cart));
        when(cartItems.findByCartIdOrderByIdAsc(1L)).thenReturn(storedItems);
        when(cartItems.save(any(CartItem.class))).thenAnswer(invocation -> {
            CartItem item = invocation.getArgument(0);
            if (item.getId() == null) { item.setId(11L); storedItems.add(item); }
            return item;
        });
        var merged = cartService.addItem("buyer", new AddCartItemRequest(3L, 1, 31L));
        assertEquals(1, merged.items().size());
        assertEquals(3, merged.items().getFirst().quantity());
        var separate = cartService.addItem("buyer", new AddCartItemRequest(3L, 2, 32L));
        assertEquals(2, separate.items().size());
        assertEquals(3, existing.getQuantity());
        assertEquals(1400000.0, separate.items().get(1).lineTotal());
    }

    @Test
    void legacyCartItemsWithoutVolumeRemainPurchasable() {
        CartItem item = CartItem.builder().product(product).quantity(2).build();
        purchases.validate(item);
        assertEquals(31L, purchases.toResponse(item).productMilId());
        assertEquals(380000.0, purchases.toResponse(item).lineTotal());
    }

    @Test
    void staleOrEmptyCartSelectionNeverFallsBackToEntireCart() {
        when(carts.findByUserEmail("buyer")).thenReturn(Optional.of(cart));
        when(cartItems.findByCartIdOrderByIdAsc(1L)).thenReturn(List.of(
                CartItem.builder().id(10L).product(product).productMil(small).quantity(1).build()));
        assertThrows(ResponseStatusException.class, () -> purchases.selectCartItems("buyer", List.of()));
        assertThrows(ResponseStatusException.class, () -> purchases.selectCartItems("buyer", List.of(99L)));
        assertThrows(ResponseStatusException.class, () -> purchases.selectCartItems("buyer", List.of(10L, 99L)));
    }

    private void stubOrderPersistence() {
        when(addresses.findByIdAndUserEmail(2L, "buyer")).thenReturn(Optional.of(address));
        when(shipping.calculateFee(eq(address), anyList(), anyDouble())).thenReturn(71500);
        when(orders.saveAndFlush(any(Order.class))).thenAnswer(invocation -> {
            Order order = invocation.getArgument(0); order.setId(100L); return order;
        });
        when(orderItems.saveAllAndFlush(anyList())).thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    void buyNowCreatesOnlyRequestedItemAndPreservesExistingCart() {
        stubOrderPersistence();
        var result = orderService.createOrderFromCart("buyer", new CreateOrderRequest(
                2L, null, PaymentMethod.COD, null, new BuyNowRequest(3L, 32L, 2)));
        assertEquals(1, result.items().size());
        assertEquals(32L, result.items().getFirst().productMilId());
        assertEquals(2, result.items().getFirst().quantity());
        assertEquals(700000.0, result.items().getFirst().unitPrice());
        assertEquals(1540000.0, result.subtotalPrice());
        assertEquals(140000.0, result.discountAmount());
        assertEquals(1471500.0, result.totalPrice());
        verify(shipping).calculateFee(eq(address), anyList(), eq(1400000.0));
        verifyNoInteractions(carts, cartItems);
    }

    @Test
    void cartOrderPurchasesAndRemovesOnlySelectedLines() {
        stubOrderPersistence();
        CartItem selected = CartItem.builder().id(10L).product(product).productMil(small).quantity(1).build();
        CartItem other = CartItem.builder().id(11L).product(product).productMil(large).quantity(2).build();
        when(carts.findByUserEmail("buyer")).thenReturn(Optional.of(cart));
        when(cartItems.findByCartIdOrderByIdAsc(1L)).thenReturn(List.of(selected, other));
        var result = orderService.createOrderFromCart("buyer", new CreateOrderRequest(
                2L, List.of(10L), PaymentMethod.COD, null, null));
        assertEquals(1, result.items().size());
        assertEquals(261500.0, result.totalPrice());
        assertEquals(220000.0 - 30000.0 + 71500.0, result.totalPrice());
        verify(cartItems).deleteAll(List.of(selected));
    }

    @Test
    void buyNowCannotBeMixedWithCartSelection() {
        when(addresses.findByIdAndUserEmail(2L, "buyer")).thenReturn(Optional.of(address));
        assertThrows(ResponseStatusException.class, () -> orderService.createOrderFromCart("buyer",
                new CreateOrderRequest(2L, List.of(10L), PaymentMethod.COD, null, new BuyNowRequest(3L, 31L, 1))));
        verifyNoInteractions(orders);
    }

    @Test
    void buyNowShippingUsesOnlyRequestedQuantityAndVariantPrice() {
        var client = mock(GhnShippingClient.class);
        var resolver = mock(GhnLocationResolver.class);
        var properties = new GhnShippingProperties();
        properties.setDefaultWeight(200);
        var service = new ShippingFeeService(addresses, properties, client, resolver, purchases);
        when(addresses.findByIdAndUserEmail(2L, "buyer")).thenReturn(Optional.of(address));
        when(resolver.resolve(address)).thenReturn(new GhnResolvedAddress(1, 2, "ward"));
        var ghnRequest = new GhnFeeRequest(1, "from", 2, "ward", 2, 1400000, 400, 10, 10, 10, null);
        when(client.buildDefaultFeeRequest(2, "ward", 1400000, 400)).thenReturn(ghnRequest);
        when(client.calculateFee(ghnRequest)).thenReturn(new GhnFeeResponse(71500, null, null, null, null, null));
        var result = service.quoteForCart("buyer", new ShippingFeeRequest(2L, null, new BuyNowRequest(3L, 32L, 2)));
        assertEquals(71500, result.shippingFee());
        verify(client).buildDefaultFeeRequest(2, "ward", 1400000, 400);
        verifyNoInteractions(carts, cartItems);
    }
}
