package com.nhom10.tmdt.dto.admin;

import com.nhom10.tmdt.enums.OrderStatus;
import com.nhom10.tmdt.enums.PaymentMethod;
import com.nhom10.tmdt.enums.PaymentStatus;
import com.nhom10.tmdt.enums.ProductType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminOrderListItemResponse {
    private Long id;
    private String code;
    private Long userId;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private String productSummary;
    private ProductType productType;
    private Integer itemCount;
    private Double totalPrice;
    private Double shippingFee;
    private Double discountAmount;
    private OrderStatus status;
    private PaymentStatus paymentStatus;
    private PaymentMethod paymentMethod;
    private String recipientName;
    private String phoneNumber;
    private String shippingAddress;
    private LocalDateTime createdAt;
    private LocalDateTime deliveredAt;
}
