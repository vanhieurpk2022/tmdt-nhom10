package com.nhom10.tmdt.dto.admin.settlement;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminSettlementOverviewDto {
    private double totalDeliveredGrossSales; // Tổng tiền hàng các đơn hoàn tất toàn sàn
    private double defaultFeeRate;           // Tỷ lệ phí sàn áp dụng (ví dụ 0.08 = 8%)
    private double totalPlatformFee;         // Tổng chi phí sàn thu được
    private double totalNetPayable;          // Tổng tiền thực tế phải giải ngân cho xưởng (Gross - Fee)
    private double totalDisbursed;           // Tổng số tiền sàn đã bấm giải ngân thực tế
    private double totalPendingDisbursement; // Số tiền còn lại đang chờ giải ngân
    private int totalFactories;              // Tổng số xưởng trên sàn
    private int factoriesWithPendingPayout;  // Số xưởng đang có tiền chờ giải ngân
}

