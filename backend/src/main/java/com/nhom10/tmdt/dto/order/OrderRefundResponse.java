package com.nhom10.tmdt.dto.order;

import com.nhom10.tmdt.enums.RefundStatus;

import java.time.LocalDateTime;

public record OrderRefundResponse(Long id, long amountVnd, String reason, RefundStatus status,
                                  LocalDateTime createdAt, LocalDateTime processedAt) {}
