package com.nhom10.tmdt.dto.admin;

import com.nhom10.tmdt.enums.OrderStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminCustomerOrderSummary {
    private Long id;
    private LocalDateTime createdAt;
    private Double totalPrice;
    private OrderStatus status;
    private String recipientName;
    private String shippingAddress;
    private int itemCount;
}