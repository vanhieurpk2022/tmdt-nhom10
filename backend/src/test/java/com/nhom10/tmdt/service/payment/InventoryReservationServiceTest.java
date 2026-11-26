package com.nhom10.tmdt.service.payment;

import com.nhom10.tmdt.enums.*;
import com.nhom10.tmdt.model.*;
import com.nhom10.tmdt.repo.ProductMilRepository;
import com.nhom10.tmdt.service.imp.PurchaseItemService;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import java.time.Clock;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class InventoryReservationServiceTest {
    @Test void reservesAndRestoresExactIngredientSnapshotOnce() {
        var variants = mock(ProductMilRepository.class);
        var purchases = mock(PurchaseItemService.class);
        var service = new InventoryReservationService(variants, purchases, mock(EntityManager.class), Clock.systemUTC(), mock(com.nhom10.tmdt.service.order.VoucherService.class));
        var factory = Factory.builder().id(1L).build();
        var ingredient = Product.builder().id(1L).factory(factory).status(ProductStatus.ACTIVE).productType(ProductType.NORMAL).build();
        var raw = ProductMil.builder().id(2L).product(ingredient).mil(10).stockQuantity(10).isActive(true).build();
        var recipe = ProductCustom.builder().items(List.of(ProductCustomItem.builder().product(ingredient).ingredientMil(raw).volumeM1(15).build())).build();
        var product = Product.builder().id(3L).factory(factory).productType(ProductType.CUSTOM).productCustom(recipe).build();
        var custom = ProductMil.builder().id(4L).product(product).mil(15).stockQuantity(5).isActive(true).build();
        var item = CartItem.builder().product(product).productMil(custom).quantity(2).build();
        when(purchases.variant(item)).thenReturn(custom);
        when(variants.lockById(2L)).thenReturn(Optional.of(raw));
        when(variants.lockById(4L)).thenReturn(Optional.of(custom));
        var allocations = service.reserve(List.of(item));
        assertEquals(6, raw.getStockQuantity());
        assertEquals(3, custom.getStockQuantity());
        recipe.setItems(List.of()); // Công thức thay đổi sau khi đặt không được làm sai hoàn kho.
        var order = Order.builder().stockHeld(true).inventoryAllocations(allocations).orderItems(List.of(mock(OrderItem.class))).build();
        service.restore(order);
        service.restore(order);
        assertEquals(10, raw.getStockQuantity());
        assertEquals(5, custom.getStockQuantity());
        assertNotNull(order.getStockRestoredAt());
    }
}
