package com.nhom10.tmdt.dto.admin.settlement;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FactorySettlementSummaryDto {
    private Long factoryId;
    private String factoryName;
    private String shopPhone;
    private String bankName;
    private String accountNumber;
    private String accountHolder;

    private int deliveredOrdersCount;
    private int pendingOrdersCount;
    private double grossSales;         // Tổng tiền hàng đơn DELIVERED
    private double platformFeeRate;    // Tỷ lệ phí sàn (0.08 = 8%)
    private double platformFee;        // Chi phí sàn (grossSales * rate)
    private double netPayable;          // Tổng tiền thực tế phải giải ngân (grossSales - platformFee)
    private double disbursedAmount;    // Đã giải ngân
    private double remainingAmount;    // Còn lại cần giải ngân
    private String status;             // PENDING, PARTIAL, COMPLETED, NONE
}

