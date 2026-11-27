package com.nhom10.tmdt.service.admin;

import com.nhom10.tmdt.dto.admin.settlement.*;
import com.nhom10.tmdt.model.*;
import com.nhom10.tmdt.repo.FactoryRepository;
import com.nhom10.tmdt.repo.FactorySettlementRepository;
import com.nhom10.tmdt.repo.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional(isolation = Isolation.READ_COMMITTED)
public class AdminSettlementServiceImp implements AdminSettlementService {

    private final FactoryRepository factoryRepository;
    private final OrderRepository orderRepository;
    private final FactorySettlementRepository settlementRepository;

    private static final double DEFAULT_FEE_RATE = 0.08; // 8% phí sàn mặc định

    private double sanitizeFeeRate(Double feeRate) {
        if (feeRate == null || feeRate < 0.0 || feeRate > 1.0) {
            return DEFAULT_FEE_RATE;
        }
        return feeRate;
    }

    @Override
    @Transactional(readOnly = true)
    public AdminSettlementOverviewDto getOverview(Double feeRate) {
        double effectiveRate = sanitizeFeeRate(feeRate);

        List<FactorySettlementSummaryDto> summaries = getFactorySummaries(effectiveRate);

        double totalDeliveredGross = 0.0;
        double totalPlatformFee = 0.0;
        double totalNetPayable = 0.0;
        double totalDisbursed = 0.0;
        double totalPending = 0.0;
        int pendingCount = 0;

        for (FactorySettlementSummaryDto s : summaries) {
            totalDeliveredGross += s.getGrossSales();
            totalPlatformFee += s.getPlatformFee();
            totalNetPayable += s.getNetPayable();
            totalDisbursed += s.getDisbursedAmount();
            totalPending += s.getRemainingAmount();
            if (s.getRemainingAmount() > 1000.0) {
                pendingCount++;
            }
        }

        return AdminSettlementOverviewDto.builder()
                .totalDeliveredGrossSales(Math.round(totalDeliveredGross * 100.0) / 100.0)
                .defaultFeeRate(effectiveRate)
                .totalPlatformFee(Math.round(totalPlatformFee * 100.0) / 100.0)
                .totalNetPayable(Math.round(totalNetPayable * 100.0) / 100.0)
                .totalDisbursed(Math.round(totalDisbursed * 100.0) / 100.0)
                .totalPendingDisbursement(Math.round(totalPending * 100.0) / 100.0)
                .totalFactories(summaries.size())
                .factoriesWithPendingPayout(pendingCount)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<FactorySettlementSummaryDto> getFactorySummaries(Double feeRate) {
        double effectiveRate = sanitizeFeeRate(feeRate);

        List<Factory> factories = factoryRepository.findAll();

        // 1. Lấy dữ liệu doanh thu đơn DELIVERED theo từng xưởng
        List<Object[]> deliveredRows = orderRepository.findDeliveredRevenueGroupByFactory();
        Map<Long, Double> deliveredGrossMap = new HashMap<>();
        Map<Long, Integer> deliveredOrdersCountMap = new HashMap<>();

        for (Object[] row : deliveredRows) {
            Long fId = (Long) row[0];
            double gross = ((Number) row[2]).doubleValue();
            int count = ((Number) row[3]).intValue();
            deliveredGrossMap.put(fId, gross);
            deliveredOrdersCountMap.put(fId, count);
        }

        // 2. Lấy dữ liệu đơn đang xử lý / đang giao (pending escrow)
        List<Object[]> pendingRows = orderRepository.findPendingRevenueGroupByFactory();
        Map<Long, Integer> pendingOrdersCountMap = new HashMap<>();
        for (Object[] row : pendingRows) {
            Long fId = (Long) row[0];
            int count = ((Number) row[3]).intValue();
            pendingOrdersCountMap.put(fId, count);
        }

        List<FactorySettlementSummaryDto> results = new ArrayList<>();

        for (Factory f : factories) {
            Long fId = f.getId();
            double gross = deliveredGrossMap.getOrDefault(fId, 0.0);
            int deliveredOrders = deliveredOrdersCountMap.getOrDefault(fId, 0);
            int pendingOrders = pendingOrdersCountMap.getOrDefault(fId, 0);

            double fee = Math.round(gross * effectiveRate * 100.0) / 100.0;
            double netPayable = Math.max(0.0, Math.round((gross - fee) * 100.0) / 100.0);

            // Tiền đã giải ngân
            Double disbursed = settlementRepository.sumDisbursedByFactoryId(fId);
            double validDisbursed = disbursed != null ? Math.round(disbursed * 100.0) / 100.0 : 0.0;

            double remaining = Math.max(0.0, Math.round((netPayable - validDisbursed) * 100.0) / 100.0);

            String status;
            if (gross <= 0.0 || netPayable <= 0.0) {
                status = "NONE";
            } else if (validDisbursed <= 0.0) {
                status = "PENDING";
            } else if (remaining > 1000.0) {
                status = "PARTIAL";
            } else {
                status = "COMPLETED";
            }

            results.add(FactorySettlementSummaryDto.builder()
                    .factoryId(fId)
                    .factoryName(f.getName())
                    .shopPhone(f.getShopPhone() != null ? f.getShopPhone() : "")
                    .bankName(f.getAddress() != null && f.getAddress().contains("Hà Nội") ? "Vietcombank (VCB)" : "MB Bank")
                    .accountNumber(f.getAccountNumber() != null ? f.getAccountNumber() : ("10" + String.format("%08d", fId * 1234567L % 100000000L)))
                    .accountHolder(f.getAccountHolder() != null ? f.getAccountHolder() : ("CÔNG TY / ĐẠI DIỆN " + f.getName().toUpperCase()))
                    .deliveredOrdersCount(deliveredOrders)
                    .pendingOrdersCount(pendingOrders)
                    .grossSales(gross)
                    .platformFeeRate(effectiveRate)
                    .platformFee(fee)
                    .netPayable(netPayable)
                    .disbursedAmount(validDisbursed)
                    .remainingAmount(remaining)
                    .status(status)
                    .build());
        }

        // Xếp theo tiền hàng giảm dần
        results.sort((a, b) -> Double.compare(b.getGrossSales(), a.getGrossSales()));
        return results;
    }

    @Override
    @Transactional(readOnly = true)
    public List<FactoryOrderSettlementDto> getFactoryOrders(Long factoryId, Double feeRate) {
        double effectiveRate = sanitizeFeeRate(feeRate);

        List<Order> orders = orderRepository.findDeliveredOrdersByFactoryId(factoryId);
        // Sắp xếp đơn hàng từ cũ đến mới theo id để đối soát theo nguyên tắc FIFO
        orders.sort(Comparator.comparing(Order::getId));

        // Tổng tiền sàn đã giải ngân cho xưởng này trước đó
        Double disbursedSum = settlementRepository.sumDisbursedByFactoryId(factoryId);
        double totalDisbursed = disbursedSum != null ? disbursedSum : 0.0;

        List<FactoryOrderSettlementDto> results = new ArrayList<>();
        double cumulativeNet = 0.0;

        for (Order o : orders) {
            double orderGross = 0.0;
            List<FactoryOrderSettlementDto.OrderItemDetailDto> itemDtos = new ArrayList<>();

            if (o.getOrderItems() != null) {
                for (OrderItem oi : o.getOrderItems()) {
                    if (oi.getProduct() != null && oi.getProduct().getFactory() != null
                            && Objects.equals(oi.getProduct().getFactory().getId(), factoryId)) {
                        double lineTotal = oi.getQuantity() * oi.getUnitPrice();
                        orderGross += lineTotal;

                        Integer mil = oi.getProductMil() != null ? oi.getProductMil().getMil() : null;
                        itemDtos.add(FactoryOrderSettlementDto.OrderItemDetailDto.builder()
                                .productName(oi.getProduct().getName())
                                .mil(mil)
                                .quantity(oi.getQuantity())
                                .unitPrice(oi.getUnitPrice())
                                .lineTotal(lineTotal)
                                .build());
                    }
                }
            }

            if (orderGross > 0.0) {
                double fee = Math.round(orderGross * effectiveRate * 100.0) / 100.0;
                double net = Math.max(0.0, Math.round((orderGross - fee) * 100.0) / 100.0);

                cumulativeNet += net;
                boolean isSettled = cumulativeNet <= (totalDisbursed + 500.0);

                results.add(FactoryOrderSettlementDto.builder()
                        .orderId(o.getId())
                        .recipientName(o.getRecipientName() != null ? o.getRecipientName() : "Khách hàng")
                        .paymentMethod(o.getPaymentMethod() != null ? o.getPaymentMethod().name() : "COD")
                        .status(o.getStatus() != null ? o.getStatus().name() : "DELIVERED")
                        .createdAt(o.getCreatedAt())
                        .deliveredAt(o.getDeliveredAt())
                        .orderGross(orderGross)
                        .platformFee(fee)
                        .netAmount(net)
                        .isSettled(isSettled)
                        .settlementStatus(isSettled ? "DISBURSED" : "PENDING")
                        .items(itemDtos)
                        .build());
            }
        }

        // Đảo ngược thứ tự để hiển thị đơn mới nhất lên đầu danh sách
        Collections.reverse(results);
        return results;
    }

    @Override
    public SettlementHistoryDto disburse(DisbursementRequestDto request, String adminUsername) {
        if (request == null || request.getFactoryId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Thiếu thông tin xưởng cần giải ngân");
        }

        Factory factory = factoryRepository.findById(request.getFactoryId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy xưởng với ID: " + request.getFactoryId()));

        double effectiveRate = sanitizeFeeRate(request.getFeeRate());

        // Kiểm tra số tiền còn lại phải giải ngân
        List<FactorySettlementSummaryDto> summaries = getFactorySummaries(effectiveRate);
        FactorySettlementSummaryDto currentSummary = summaries.stream()
                .filter(s -> Objects.equals(s.getFactoryId(), request.getFactoryId()))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Xưởng không có dữ liệu đối soát"));

        if (currentSummary.getRemainingAmount() <= 0.0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Xưởng này đã được giải ngân đầy đủ, không còn số dư cần thanh toán");
        }

        double requestedAmount = request.getAmount();
        if (requestedAmount <= 0.0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Số tiền giải ngân phải lớn hơn 0");
        }

        if (requestedAmount > currentSummary.getRemainingAmount() + 500.0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Số tiền giải ngân (" + requestedAmount
                    + " đ) vượt quá số dư còn lại (" + currentSummary.getRemainingAmount() + " đ)");
        }

        // Tính tỷ lệ tiền hàng và phí sàn tương ứng cho đợt giải ngân này
        double ratio = requestedAmount / (currentSummary.getNetPayable() > 0 ? currentSummary.getNetPayable() : 1.0);
        double proportionalGross = Math.round(currentSummary.getGrossSales() * ratio * 100.0) / 100.0;
        double proportionalFee = Math.round(currentSummary.getPlatformFee() * ratio * 100.0) / 100.0;

        String txCode = (request.getTransactionCode() != null && !request.getTransactionCode().isBlank())
                ? request.getTransactionCode().trim()
                : ("DISB-" + System.currentTimeMillis() + "-" + factory.getId());

        String bankName = (request.getBankName() != null && !request.getBankName().isBlank())
                ? request.getBankName() : currentSummary.getBankName();
        String accNum = (request.getAccountNumber() != null && !request.getAccountNumber().isBlank())
                ? request.getAccountNumber() : currentSummary.getAccountNumber();
        String accHolder = (request.getAccountHolder() != null && !request.getAccountHolder().isBlank())
                ? request.getAccountHolder() : currentSummary.getAccountHolder();

        FactorySettlement settlement = FactorySettlement.builder()
                .factory(factory)
                .amount(requestedAmount)
                .grossSales(proportionalGross)
                .platformFee(proportionalFee)
                .platformFeeRate(effectiveRate)
                .bankName(bankName)
                .accountNumber(accNum)
                .accountHolder(accHolder)
                .transactionCode(txCode)
                .note(request.getNote() != null ? request.getNote().trim() : "Giải ngân định kỳ")
                .status("COMPLETED")
                .disbursedBy(adminUsername != null ? adminUsername : "admin")
                .createdAt(LocalDateTime.now())
                .build();

        FactorySettlement saved = settlementRepository.save(settlement);

        return toHistoryDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SettlementHistoryDto> getHistory() {
        List<FactorySettlement> list = settlementRepository.findAllByOrderByCreatedAtDesc();
        return list.stream().map(this::toHistoryDto).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<SettlementHistoryDto> getFactoryHistory(Long factoryId) {
        List<FactorySettlement> list = settlementRepository.findByFactoryIdOrderByCreatedAtDesc(factoryId);
        return list.stream().map(this::toHistoryDto).toList();
    }

    private SettlementHistoryDto toHistoryDto(FactorySettlement fs) {
        return SettlementHistoryDto.builder()
                .id(fs.getId())
                .factoryId(fs.getFactory().getId())
                .factoryName(fs.getFactory().getName())
                .amount(fs.getAmount())
                .grossSales(fs.getGrossSales())
                .platformFee(fs.getPlatformFee())
                .platformFeeRate(fs.getPlatformFeeRate())
                .bankName(fs.getBankName())
                .accountNumber(fs.getAccountNumber())
                .accountHolder(fs.getAccountHolder())
                .transactionCode(fs.getTransactionCode())
                .note(fs.getNote())
                .status(fs.getStatus())
                .disbursedBy(fs.getDisbursedBy())
                .disbursedAt(fs.getCreatedAt())
                .build();
    }
}

