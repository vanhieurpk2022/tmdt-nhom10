package com.nhom10.tmdt.dto.admin;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class AdminCreateDispatchOrderRequest {
    private Long userId;
    private String recipientName;
    private String phoneNumber;
    private String shippingAddress;
    private String note;
    private Long productId;
    private Long factoryId;
    private Integer quantity;
    private Double unitPrice;
    private Double totalPrice;
    private Double shippingFee;
    private Double discountAmount;
    private String voucherCode;
}
