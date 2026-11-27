package com.nhom10.tmdt.rest;

import com.nhom10.tmdt.dto.ApiResponse;
import com.nhom10.tmdt.dto.admin.settlement.*;
import com.nhom10.tmdt.service.admin.AdminSettlementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/admin/settlements")
public class AdminSettlementController {

    private final AdminSettlementService settlementService;

    /**
     * Lấy các chỉ số KPI tài chính tổng quan toàn sàn:
     * Tổng tiền hàng, Chi phí sàn, Tổng thực tế phải giải ngân, Đã giải ngân, Còn lại
     */
    @GetMapping("/overview")
    public ApiResponse<AdminSettlementOverviewDto> getOverview(
            @RequestParam(required = false) Double feeRate
    ) {
        AdminSettlementOverviewDto data = settlementService.getOverview(feeRate);
        return new ApiResponse<>(200, "Lấy dữ liệu tổng quan giải ngân thành công", data);
    }

    /**
     * Danh sách bảng đối soát giải ngân chi tiết theo từng xưởng
     */
    @GetMapping("/factories")
    public ApiResponse<List<FactorySettlementSummaryDto>> getFactorySummaries(
            @RequestParam(required = false) Double feeRate
    ) {
        List<FactorySettlementSummaryDto> list = settlementService.getFactorySummaries(feeRate);
        return new ApiResponse<>(200, "Lấy danh sách đối soát xưởng thành công", list);
    }

    /**
     * Chi tiết các đơn hàng hoàn tất (DELIVERED) của một xưởng
     */
    @GetMapping("/factories/{factoryId}/orders")
    public ApiResponse<List<FactoryOrderSettlementDto>> getFactoryOrders(
            @PathVariable Long factoryId,
            @RequestParam(required = false) Double feeRate
    ) {
        List<FactoryOrderSettlementDto> orders = settlementService.getFactoryOrders(factoryId, feeRate);
        return new ApiResponse<>(200, "Lấy danh sách đơn hàng đối soát thành công", orders);
    }

    /**
     * Thực hiện giải ngân cho xưởng
     */
    @PostMapping("/disburse")
    public ApiResponse<SettlementHistoryDto> disburse(
            @Valid @RequestBody DisbursementRequestDto request,
            Authentication authentication
    ) {
        String adminUser = authentication != null ? authentication.getName() : "admin";
        SettlementHistoryDto result = settlementService.disburse(request, adminUser);
        return new ApiResponse<>(200, "Giải ngân thành công cho xưởng", result);
    }

    /**
     * Lịch sử tất cả các đợt đã giải ngân
     */
    @GetMapping("/history")
    public ApiResponse<List<SettlementHistoryDto>> getHistory() {
        List<SettlementHistoryDto> history = settlementService.getHistory();
        return new ApiResponse<>(200, "Lấy lịch sử giải ngân thành công", history);
    }
}

