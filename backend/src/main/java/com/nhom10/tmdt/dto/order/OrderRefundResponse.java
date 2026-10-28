package com.nhom10.tmdt.dto.order;

import com.nhom10.tmdt.enums.RefundStatus;

import java.time.LocalDateTime;
import java.time.Instant;

public record OrderRefundResponse(Long id, long amountVnd, String reason, RefundStatus status,
                                  LocalDateTime createdAt, Instant processedAt) {}
