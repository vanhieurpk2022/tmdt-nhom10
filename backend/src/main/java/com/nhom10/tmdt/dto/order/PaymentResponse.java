package com.nhom10.tmdt.dto.order;

import java.time.Instant;
public record PaymentResponse(OrderResponse order, String txnRef, String paymentUrl, Instant expiresAt) {}
