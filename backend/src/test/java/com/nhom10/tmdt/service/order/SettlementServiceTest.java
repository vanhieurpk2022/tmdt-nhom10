package com.nhom10.tmdt.service.order;

import com.nhom10.tmdt.enums.*;
import com.nhom10.tmdt.model.*;
import com.nhom10.tmdt.repo.*;
import com.nhom10.tmdt.security.FactoryAccess;
import jakarta.persistence.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class SettlementServiceTest {
    private final FactoryRepository factories = mock(FactoryRepository.class);
    private final OrderRepository orders = mock(OrderRepository.class);
    private final SettlementPaymentRepository payments = mock(SettlementPaymentRepository.class);
    private final EntityManager entityManager = mock(EntityManager.class);
    private final SettlementService service = new SettlementService(factories, orders, payments, mock(FactoryAccess.class), entityManager);
    private final Factory factory = Factory.builder().id(1L).name("Xưởng A").build();

    @BeforeEach void fixture() {
        var own = Product.builder().id(1L).factory(factory).name("Sản phẩm A").build();
        var other = Product.builder().id(2L).factory(Factory.builder().id(2L).build()).name("Sản phẩm B").build();
        var items = List.of(OrderItem.builder().product(own).unitPrice(150000).quantity(2).build(),
                OrderItem.builder().product(other).unitPrice(800000).quantity(1).build());
        var delivered = Order.builder().id(1L).status(OrderStatus.DELIVERED).paymentStatus(PaymentStatus.PAID).paymentMethod(PaymentMethod.VNPAY).orderItems(items).build();
        var unpaid = Order.builder().id(2L).status(OrderStatus.DELIVERED).paymentStatus(PaymentStatus.PENDING).paymentMethod(PaymentMethod.VNPAY).orderItems(items).build();
        when(orders.findAll()).thenReturn(List.of(delivered, unpaid));
        when(payments.findByFactoryIdOrderByIdDesc(1L)).thenReturn(List.of());
    }
    @Test void countsOnlyOwnItemsAndCompletedPaidOrders() {
        var summary = service.summary(factory, null);
        assertEquals(300000L, summary.get("grossSales"));
        assertEquals(24000L, summary.get("platformFee"));
        assertEquals(276000L, summary.get("remainingAmount"));
        assertEquals(1, summary.get("deliveredOrdersCount"));
    }
    @Test void refusesOverpayment() {
        when(entityManager.find(Factory.class, 1L, LockModeType.PESSIMISTIC_WRITE)).thenReturn(factory);
        when(payments.findByTransactionCode("TX1")).thenReturn(Optional.empty());
        var request = new SettlementService.Disbursement(1L, 300000, 0.08, "Bank", "123", "Owner", "TX1", null);
        assertThrows(ResponseStatusException.class, () -> service.record(request, "admin"));
        verify(payments, never()).saveAndFlush(any());
    }
    @Test void reflectsPartialDisbursement() {
        when(payments.findByFactoryIdOrderByIdDesc(1L)).thenReturn(List.of(SettlementPayment.builder().amount(100000).build()));
        var summary = service.summary(factory, null);
        assertEquals(176000L, summary.get("remainingAmount"));
        assertEquals("PARTIAL", summary.get("status"));
    }
}
