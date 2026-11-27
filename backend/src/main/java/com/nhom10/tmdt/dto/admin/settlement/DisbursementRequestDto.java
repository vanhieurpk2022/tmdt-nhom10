package com.nhom10.tmdt.dto.admin.settlement;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DisbursementRequestDto {
    @NotNull(message = "Mã xưởng không được để trống")
    private Long factoryId;

    @NotNull(message = "Số tiền giải ngân không được để trống")
    @DecimalMin(value = "1000.0", message = "Số tiền giải ngân tối thiểu là 1.000 đ")
    private Double amount;

    private Double feeRate; // Tỷ lệ phí sàn áp dụng, mặc định 0.08 nếu null

    private String bankName;
    private String accountNumber;
    private String accountHolder;

    private String transactionCode; // Mã giao dịch ngân hàng / Ref
    private String note;            // Ghi chú giải ngân
}

