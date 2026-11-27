package com.nhom10.tmdt.service.admin;

import com.nhom10.tmdt.dto.admin.settlement.*;

import java.util.List;

public interface AdminSettlementService {

    /**
     * Lấy các chỉ số KPI tài chính tổng quan toàn sàn:
     * Tổng tiền hàng đã giao, Tỷ lệ phí sàn, Tổng phí sàn thu, Tổng thực tế phải giải ngân,
     * Tổng đã giải ngân, Số tiền còn chờ giải ngân.
     */
    AdminSettlementOverviewDto getOverview(Double feeRate);

    /**
     * Lấy danh sách tóm tắt đối soát theo từng Xưởng:
     * Tiền hàng, Phí sàn, Tiền thực tế phải giải ngân (Net), Đã giải ngân, Còn lại, Trạng thái
     */
    List<FactorySettlementSummaryDto> getFactorySummaries(Double feeRate);

    /**
     * Chi tiết các đơn hàng hoàn tất (DELIVERED) của một xưởng
     */
    List<FactoryOrderSettlementDto> getFactoryOrders(Long factoryId, Double feeRate);

    /**
     * Thực hiện giải ngân cho xưởng
     */
    SettlementHistoryDto disburse(DisbursementRequestDto request, String adminUsername);

    /**
     * Lịch sử các lần đã giải ngân
     */
    List<SettlementHistoryDto> getHistory();

    /**
     * Lịch sử giải ngân của riêng một xưởng
     */
    List<SettlementHistoryDto> getFactoryHistory(Long factoryId);
}

