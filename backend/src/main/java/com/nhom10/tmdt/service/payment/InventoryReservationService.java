package com.nhom10.tmdt.service.payment;

import com.nhom10.tmdt.model.*;
import com.nhom10.tmdt.repo.ProductMilRepository;
import com.nhom10.tmdt.service.imp.PurchaseItemService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import java.util.*;
import java.time.Clock;
import java.time.temporal.ChronoUnit;

@Service
@RequiredArgsConstructor
public class InventoryReservationService {
    private final ProductMilRepository variants;
    private final PurchaseItemService purchases;
    private final EntityManager entityManager;
    private final Clock clock;

    // Caller owns the order transaction. Lock variants in ascending order across all checkouts.
    @Transactional(propagation = Propagation.MANDATORY)
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

    @Transactional(propagation = Propagation.MANDATORY)
    public void release(Order order) {
        if (!order.isStockHeld()) return;
        restore(order);
    }

    // Caller must hold the order lock before locking its variants.
    @Transactional(propagation = Propagation.MANDATORY)
    public void restore(Order order) {
        if (order.getStockRestoredAt() != null) return;
        if (order.getOrderItems() == null || order.getOrderItems().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Đơn hàng thiếu dữ liệu để hoàn kho");
        }
        try {
            Map<Long, Integer> quantities = new TreeMap<>();
            for (OrderItem item : order.getOrderItems()) {
                if (item.getProductMil() == null || item.getProduct() == null || item.getQuantity() <= 0
                        || item.getProductMil().getProduct() == null
                        || !Objects.equals(item.getProductMil().getProduct().getId(), item.getProduct().getId())) {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "Chi tiết đơn hàng cần được kiểm tra trước khi hoàn kho");
                }
                quantities.merge(item.getProductMil().getId(), item.getQuantity(), Math::addExact);
            }
            quantities.forEach((id, quantity) -> {
                ProductMil variant = locked(id);
                variant.setStockQuantity(Math.addExact(variant.getStockQuantity(), quantity));
            });
        } catch (ArithmeticException ex) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Số lượng hoàn kho vượt giới hạn cho phép");
        }
        order.setStockHeld(false);
        order.setStockRestoredAt(clock.instant().truncatedTo(ChronoUnit.MICROS));
    }

    private ProductMil locked(Long id) {
        ProductMil variant = variants.lockById(id).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.CONFLICT, "Không tìm thấy dung tích sản phẩm"));
        // The catalog may already be in the persistence context; refresh after acquiring the lock.
        entityManager.refresh(variant, LockModeType.PESSIMISTIC_WRITE);
        return variant;
    }
}
