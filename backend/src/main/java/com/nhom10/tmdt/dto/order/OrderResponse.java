package com.nhom10.tmdt.dto.order;

import com.nhom10.tmdt.enums.OrderStatus;
import com.nhom10.tmdt.enums.PaymentMethod;
import com.nhom10.tmdt.enums.CancelReason;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;

public record OrderResponse(
        Long id,
        OrderStatus status,
        PaymentMethod paymentMethod,
        String recipientName,
        String phoneNumber,
        String shippingAddress,
        String note,
        double subtotalPrice,
        double shippingFee,
        double totalPrice,
        LocalDateTime createdAt,
        List<OrderItemResponse> items,
        com.nhom10.tmdt.enums.PaymentStatus paymentStatus,
        CancelReason cancelReason,
        Instant cancelledAt,
        String cancellationNote
) {
}
