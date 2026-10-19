package com.nhom10.tmdt.dto.order;

import com.nhom10.tmdt.enums.*;
import java.time.Instant;
public record PaymentStatusResponse(Long orderId, OrderStatus orderStatus, PaymentStatus paymentStatus,
        String attemptStatus, boolean canRetry, boolean needsReview, Instant reservationExpiresAt, String txnRef) {}
