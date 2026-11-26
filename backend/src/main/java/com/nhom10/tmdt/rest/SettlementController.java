package com.nhom10.tmdt.rest;

import com.nhom10.tmdt.dto.ApiResponse;
import com.nhom10.tmdt.service.order.SettlementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController @RequiredArgsConstructor
public class SettlementController {
    private final SettlementService service;
    @GetMapping("/admin/settlements/overview")
    public ApiResponse<Map<String, Object>> overview(@RequestParam(required = false) Double feeRate) { return new ApiResponse<>(200, "Đối soát", service.overview(feeRate)); }
    @GetMapping("/admin/settlements/factories")
    public ApiResponse<List<Map<String, Object>>> factories(@RequestParam(required = false) Double feeRate) { return new ApiResponse<>(200, "Đối soát xưởng", service.summaries(feeRate)); }
    @GetMapping("/admin/settlements/factories/{id}/orders")
    public ApiResponse<List<Map<String, Object>>> orders(@PathVariable Long id, @RequestParam(required = false) Double feeRate) { return new ApiResponse<>(200, "Đơn đủ điều kiện", service.factoryOrders(id, feeRate)); }
    @GetMapping("/admin/settlements/history")
    public ApiResponse<List<Map<String, Object>>> history() { return new ApiResponse<>(200, "Lịch sử biên nhận", service.history(null)); }
    @PostMapping("/admin/settlements/disburse")
    public ApiResponse<Map<String, Object>> record(@Valid @RequestBody SettlementService.Disbursement request, Principal principal) { return new ApiResponse<>(200, "Đã ghi nhận biên nhận chuyển tiền", service.record(request, principal.getName())); }
    @GetMapping("/manager/settlements/summary")
    public ApiResponse<Map<String, Object>> currentSummary() { return new ApiResponse<>(200, "Đối soát xưởng", service.currentSummary()); }
    @GetMapping("/manager/settlements/orders")
    public ApiResponse<List<Map<String, Object>>> currentOrders() { return new ApiResponse<>(200, "Đơn đủ điều kiện", service.factoryOrders(service.currentFactoryId(), null)); }
    @GetMapping("/manager/settlements/history")
    public ApiResponse<List<Map<String, Object>>> currentHistory() { return new ApiResponse<>(200, "Lịch sử biên nhận", service.history(service.currentFactoryId())); }
}
