package com.nhom10.tmdt.dto.admin.settlement;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SettlementHistoryDto {
    private Long id;
    private Long factoryId;
    private String factoryName;
    private double amount;          // Số tiền thực tế đã giải ngân
    private double grossSales;      // Doanh thu tương ứng
    private double platformFee;     // Phí sàn khấu trừ
    private double platformFeeRate; // % phí sàn
    private String bankName;
    private String accountNumber;
    private String accountHolder;
    private String transactionCode;
    private String note;
    private String status;
    private String disbursedBy;
    private LocalDateTime disbursedAt;
}

