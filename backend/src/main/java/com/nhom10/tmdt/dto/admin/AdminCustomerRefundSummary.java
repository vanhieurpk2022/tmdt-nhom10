package com.nhom10.tmdt.dto.admin;

import com.nhom10.tmdt.enums.RefundStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminCustomerRefundSummary {
    private Long id;
    private Long orderId;
    private String reason;
    private RefundStatus status;
    private Long amount;
    private LocalDateTime createdAt;
    private LocalDateTime processedAt;
}
