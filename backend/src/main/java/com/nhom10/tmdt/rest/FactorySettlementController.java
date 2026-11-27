package com.nhom10.tmdt.rest;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import com.nhom10.tmdt.dto.ApiResponse;
import com.nhom10.tmdt.dto.admin.settlement.FactoryOrderSettlementDto;
import com.nhom10.tmdt.dto.admin.settlement.FactorySettlementSummaryDto;
import com.nhom10.tmdt.dto.admin.settlement.SettlementHistoryDto;
import com.nhom10.tmdt.model.User;
import com.nhom10.tmdt.repo.UserRepository;
import com.nhom10.tmdt.service.admin.AdminSettlementService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/manager/settlements")
@RequiredArgsConstructor
public class FactorySettlementController {

    private final AdminSettlementService settlementService;
    private final UserRepository userRepository;

    private Long getFactoryId(UserDetails userDetails) {
        if (userDetails == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Chưa đăng nhập");
        }
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy người dùng"));
        if (user.getFactory() == null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Tài khoản không gắn với xưởng nào");
        }
        return user.getFactory().getId();
    }

    /**
     * Tóm tắt tình hình đối soát & giải ngân của riêng xưởng đang đăng nhập (chỉ xem)
     */
    @GetMapping("/summary")
    public ApiResponse<FactorySettlementSummaryDto> getMySummary(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "0.08") Double feeRate
    ) {
        Long factoryId = getFactoryId(userDetails);
        List<FactorySettlementSummaryDto> summaries = settlementService.getFactorySummaries(feeRate);
        FactorySettlementSummaryDto summary = summaries.stream()
                .filter(s -> s.getFactoryId().equals(factoryId))
                .findFirst()
                .orElse(null);
        return new ApiResponse<>(200, "Lấy thông tin giải ngân xưởng thành công", summary);
    }

    /**
     * Danh sách đơn hàng hoàn tất kèm phân loại đã giải ngân / chưa giải ngân (chỉ xem)
     */
    @GetMapping("/orders")
    public ApiResponse<List<FactoryOrderSettlementDto>> getMyOrders(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "0.08") Double feeRate
    ) {
        Long factoryId = getFactoryId(userDetails);
        List<FactoryOrderSettlementDto> orders = settlementService.getFactoryOrders(factoryId, feeRate);
        return new ApiResponse<>(200, "Lấy danh sách đơn hàng đối soát thành công", orders);
    }

    /**
     * Lịch sử các đợt nhận tiền giải ngân từ Sàn về tài khoản xưởng (chỉ xem)
     */
    @GetMapping("/history")
    public ApiResponse<List<SettlementHistoryDto>> getMyHistory(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long factoryId = getFactoryId(userDetails);
        List<SettlementHistoryDto> history = settlementService.getFactoryHistory(factoryId);
        return new ApiResponse<>(200, "Lấy lịch sử giải ngân của xưởng thành công", history);
    }
}
