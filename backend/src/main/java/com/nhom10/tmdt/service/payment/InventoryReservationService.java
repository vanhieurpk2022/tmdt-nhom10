package com.nhom10.tmdt.service.payment;

import com.nhom10.tmdt.model.*;
import com.nhom10.tmdt.repo.ProductMilRepository;
import com.nhom10.tmdt.service.imp.PurchaseItemService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import java.util.*;

@Service
@RequiredArgsConstructor
public class InventoryReservationService {
    private final ProductMilRepository variants;
    private final PurchaseItemService purchases;
    private final EntityManager entityManager;

    // Caller owns the order transaction. Lock variants in ascending order across all checkouts.
    public void reserve(List<CartItem> items) {
        Map<Long, Integer> quantities = new TreeMap<>();
        for (CartItem item : items) {
            quantities.merge(purchases.variant(item).getId(), item.getQuantity(), Math::addExact);
        }
        for (var entry : quantities.entrySet()) {
            ProductMil variant = locked(entry.getKey());
            if (!variant.isActive() || variant.getStockQuantity() < entry.getValue()) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Sản phẩm vừa hết hàng, vui lòng chọn lại");
            }
            for (CartItem item : items) {
                if (Objects.equals(purchases.variant(item).getId(), variant.getId())) item.setProductMil(variant);
            }
            variant.setStockQuantity(variant.getStockQuantity() - entry.getValue());
        }
    }

    public void release(Order order) {
        if (!order.isStockHeld()) return;
        Map<Long, Integer> quantities = new TreeMap<>();
        for (OrderItem item : order.getOrderItems()) {
            quantities.merge(item.getProductMil().getId(), item.getQuantity(), Math::addExact);
        }
        quantities.forEach((id, quantity) -> {
            ProductMil variant = locked(id);
            variant.setStockQuantity(Math.addExact(variant.getStockQuantity(), quantity));
        });
        order.setStockHeld(false);
    }

    private ProductMil locked(Long id) {
        ProductMil variant = variants.lockById(id).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.CONFLICT, "Không tìm thấy dung tích sản phẩm"));
        // The catalog may already be in the persistence context; refresh after acquiring the lock.
        entityManager.refresh(variant, LockModeType.PESSIMISTIC_WRITE);
        return variant;
    }
}
