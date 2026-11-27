package com.nhom10.tmdt.dto.admin.settlement;

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
public class FactoryOrderSettlementDto {
    private Long orderId;
    private String recipientName;
    private String paymentMethod;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime deliveredAt;
    private double orderGross;     // Tổng tiền hàng của xưởng trong đơn
    private double platformFee;    // Phí sàn của đơn này
    private double netAmount;      // Tiền xưởng thực nhận cho đơn này
    private Boolean isSettled;     // true: đã giải ngân, false: chưa giải ngân
    private String settlementStatus; // DISBURSED, PENDING
    private List<OrderItemDetailDto> items;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItemDetailDto {
        private String productName;
        private Integer mil;
        private int quantity;
        private double unitPrice;
        private double lineTotal;
    }
}

