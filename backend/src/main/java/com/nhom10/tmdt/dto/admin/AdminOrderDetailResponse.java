package com.nhom10.tmdt.dto.admin;

import com.nhom10.tmdt.enums.CancelReason;
import com.nhom10.tmdt.enums.OrderStatus;
import com.nhom10.tmdt.enums.PaymentMethod;
import com.nhom10.tmdt.enums.PaymentStatus;
import com.nhom10.tmdt.enums.ProductType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminOrderDetailResponse {
    private Long id;
    private String code;
    private LocalDateTime createdAt;
    private LocalDateTime deliveredAt;
    private LocalDateTime expectedDeliveryAt;
    private OrderStatus status;
    private PaymentStatus paymentStatus;
    private PaymentMethod paymentMethod;
    private Double subtotalPrice;
    private Double shippingFee;
    private Double discountAmount;
    private Double totalPrice;
    private String note;
    private CancelReason cancelReason;

    private UserSummary user;
    private RecipientSummary recipient;
    private List<OrderItemSummary> items;
    private List<String> vouchers;
    private List<AdminCustomerRefundSummary> refunds;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserSummary {
        private Long id;
        private String name;
        private String email;
        private String phone;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecipientSummary {
        private String name;
        private String phone;
        private String address;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItemSummary {
        private Long id;
        private Long productId;
        private String productName;
        private String productImage;
        private ProductType productType;
        private Integer scentTier;
        private Double volumeMl;
        private Integer quantity;
        private Double unitPrice;
        private Double totalPrice;
        private Long factoryId;
        private String factoryName;
    }
}
