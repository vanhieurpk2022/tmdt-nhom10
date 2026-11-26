package com.nhom10.tmdt.service.order;

import com.nhom10.tmdt.enums.*;
import com.nhom10.tmdt.model.Order;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;
import java.time.Clock;
import static org.junit.jupiter.api.Assertions.*;

class OrderStatusTest {
    private final OrderCancellationService service = new OrderCancellationService(null, null, null, null, null, null, null, Clock.systemUTC());
    @Test void deliveringCodBecomesPaidWhenDelivered() {
        var order = Order.builder().status(OrderStatus.DELIVERING).paymentMethod(PaymentMethod.COD)
                .paymentStatus(PaymentStatus.PENDING).checkoutFingerprint("test").build();
        service.updateStatus(order, OrderStatus.DELIVERED, null, null, "factory");
        assertEquals(PaymentStatus.PAID, order.getPaymentStatus());
        assertNotNull(order.getDeliveredAt());
    }
    @Test void unpaidVnpayCannotBeDelivered() {
        var order = Order.builder().status(OrderStatus.DELIVERING).paymentMethod(PaymentMethod.VNPAY)
                .paymentStatus(PaymentStatus.PENDING).checkoutFingerprint("test").build();
        assertThrows(ResponseStatusException.class, () -> service.updateStatus(order, OrderStatus.DELIVERED, null, null, "factory"));
    }
}
