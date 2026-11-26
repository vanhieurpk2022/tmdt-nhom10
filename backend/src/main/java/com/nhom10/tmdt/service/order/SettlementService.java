package com.nhom10.tmdt.service.order;

import com.nhom10.tmdt.enums.*;
import com.nhom10.tmdt.model.*;
import com.nhom10.tmdt.repo.*;
import com.nhom10.tmdt.security.FactoryAccess;
import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
import jakarta.validation.constraints.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.time.LocalDateTime;
import java.util.*;

@Service @RequiredArgsConstructor @Transactional(readOnly = true)
public class SettlementService {
    private final FactoryRepository factories;
    private final OrderRepository orders;
    private final SettlementPaymentRepository payments;
    private final FactoryAccess access;
    private final EntityManager entityManager;
    @Value("${settlement.fee-rate:0.08}") private double defaultRate = 0.08;

    public record Disbursement(@NotNull @Positive Long factoryId, @Positive long amount,
                               Double feeRate, @NotBlank String bankName, @NotBlank String accountNumber,
                               @NotBlank String accountHolder, @NotBlank @Size(max = 100) String transactionCode,
                               @Size(max = 500) String note) {}

    private static Map<String, Object> row(Object... pairs) {
        Map<String, Object> result = new LinkedHashMap<>();
        for (int i = 0; i < pairs.length; i += 2) result.put((String) pairs[i], pairs[i + 1]);
        return result;
    }

    private double rate(Double requested) {
        double rate = requested == null ? defaultRate : requested;
        if (!Double.isFinite(rate) || rate < 0 || rate > 1) throw invalid("Tỷ lệ phí phải từ 0 đến 1");
        return rate;
    }

    private List<OrderItem> items(Order order, Long factoryId) {
        return order.getOrderItems() == null ? List.of() : order.getOrderItems().stream()
                .filter(i -> i.getProduct() != null && i.getProduct().getFactory() != null
                        && factoryId.equals(i.getProduct().getFactory().getId())).toList();
    }

    private boolean payable(Order order) {
        return order.getStatus() == OrderStatus.DELIVERED && (order.getPaymentStatus() == PaymentStatus.PAID
                || order.getPaymentMethod() == PaymentMethod.COD && order.getPaymentStatus() == PaymentStatus.PENDING);
    }

    private long gross(List<OrderItem> items) {
        return items.stream().mapToLong(i -> Math.multiplyExact(Math.round(i.getUnitPrice()), i.getQuantity())).sum();
    }

    public List<Map<String, Object>> factoryOrders(Long factoryId, Double requestedRate) {
        double rate = rate(requestedRate);
        long disbursed = payments.findByFactoryIdOrderByIdDesc(factoryId).stream().mapToLong(SettlementPayment::getAmount).sum();
        List<Map<String, Object>> result = new ArrayList<>();
        for (Order order : orders.findAll().stream().filter(this::payable).sorted(Comparator.comparing(Order::getId)).toList()) {
            var items = items(order, factoryId);
            if (items.isEmpty()) continue;
            long gross = gross(items), fee = Math.round(gross * rate), net = gross - fee;
            boolean settled = disbursed >= net;
            disbursed = Math.max(0, disbursed - net);
            result.add(row("orderId", order.getId(), "recipientName", order.getRecipientName(),
                    "paymentMethod", order.getPaymentMethod(), "status", order.getStatus(),
                    "createdAt", order.getCreatedAt(), "deliveredAt", order.getDeliveredAt(),
                    "orderGross", gross, "platformFee", fee, "netAmount", net,
                    "isSettled", settled, "settlementStatus", settled ? "DISBURSED" : "PENDING",
                    "items", items.stream().map(i -> row("productName", i.getProduct().getName(),
                            "mil", i.getProductMil() == null ? null : i.getProductMil().getMil(),
                            "quantity", i.getQuantity(), "unitPrice", i.getUnitPrice(),
                            "lineTotal", i.getUnitPrice() * i.getQuantity())).toList()));
        }
        return result;
    }

    public Map<String, Object> summary(Factory factory, Double requestedRate) {
        double rate = rate(requestedRate);
        var rows = factoryOrders(factory.getId(), rate);
        long gross = rows.stream().mapToLong(r -> (Long) r.get("orderGross")).sum();
        long fee = rows.stream().mapToLong(r -> (Long) r.get("platformFee")).sum();
        long paid = payments.findByFactoryIdOrderByIdDesc(factory.getId()).stream().mapToLong(SettlementPayment::getAmount).sum();
        long remaining = Math.max(0, gross - fee - paid);
        return row("factoryId", factory.getId(), "factoryName", factory.getName(), "shopPhone", factory.getShopPhone(),
                "bankName", "", "accountNumber", factory.getAccountNumber(), "accountHolder", factory.getAccountHolder(),
                "deliveredOrdersCount", rows.size(), "pendingOrdersCount", rows.stream().filter(r -> !(Boolean) r.get("isSettled")).count(),
                "grossSales", gross, "platformFeeRate", rate, "platformFee", fee, "netPayable", gross - fee,
                "disbursedAmount", paid, "remainingAmount", remaining,
                "status", gross == 0 ? "NONE" : remaining == 0 ? "COMPLETED" : paid > 0 ? "PARTIAL" : "PENDING");
    }

    public List<Map<String, Object>> summaries(Double feeRate) { return factories.findAll().stream().map(f -> summary(f, feeRate)).toList(); }

    public Map<String, Object> overview(Double feeRate) {
        var rows = summaries(feeRate);
        return row("totalDeliveredGrossSales", sum(rows, "grossSales"), "defaultFeeRate", rate(feeRate),
                "totalPlatformFee", sum(rows, "platformFee"), "totalNetPayable", sum(rows, "netPayable"),
                "totalDisbursed", sum(rows, "disbursedAmount"), "totalPendingDisbursement", sum(rows, "remainingAmount"),
                "totalFactories", rows.size(), "factoriesWithPendingPayout", rows.stream().filter(r -> (Long) r.get("remainingAmount") > 0).count());
    }

    private long sum(List<Map<String, Object>> rows, String field) { return rows.stream().mapToLong(r -> (Long) r.get(field)).sum(); }
    public Long currentFactoryId() { return access.currentUser().getFactory().getId(); }
    public Map<String, Object> currentSummary() { return summary(access.currentUser().getFactory(), null); }

    public List<Map<String, Object>> history(Long factoryId) {
        var rows = factoryId == null ? payments.findAll() : payments.findByFactoryIdOrderByIdDesc(factoryId);
        return rows.stream().sorted(Comparator.comparing(SettlementPayment::getId).reversed()).map(this::historyRow).toList();
    }

    private Map<String, Object> historyRow(SettlementPayment p) {
        return row("id", p.getId(), "factoryId", p.getFactory().getId(), "factoryName", p.getFactory().getName(),
                "amount", p.getAmount(), "grossSales", p.getGrossSales(), "platformFee", p.getPlatformFee(),
                "platformFeeRate", p.getPlatformFeeRate(), "bankName", p.getBankName(), "accountNumber", p.getAccountNumber(),
                "accountHolder", p.getAccountHolder(), "transactionCode", p.getTransactionCode(), "note", p.getNote(),
                "status", "RECORDED", "disbursedBy", p.getDisbursedBy(), "disbursedAt", p.getDisbursedAt());
    }

    @Transactional
    public Map<String, Object> record(Disbursement request, String actor) {
        Factory factory = entityManager.find(Factory.class, request.factoryId(), LockModeType.PESSIMISTIC_WRITE);
        if (factory == null) throw invalid("Không tìm thấy xưởng");
        var previous = payments.findByTransactionCode(request.transactionCode().trim());
        if (previous.isPresent()) {
            var p = previous.get();
            if (!p.getFactory().getId().equals(factory.getId()) || p.getAmount() != request.amount()) throw invalid("Mã giao dịch đã được dùng");
            return historyRow(p);
        }
        if (request.feeRate() != null && Math.abs(request.feeRate() - defaultRate) > 0.000001) throw invalid("Bản xem trước khác mức phí hiện hành; vui lòng tải lại");
        var summary = summary(factory, null);
        if (request.amount() <= 0 || request.amount() > (Long) summary.get("remainingAmount")) throw invalid("Số tiền vượt số dư cần đối soát");
        var payment = SettlementPayment.builder().factory(factory).amount(request.amount())
                .grossSales((Long) summary.get("grossSales")).platformFee((Long) summary.get("platformFee"))
                .platformFeeRate(defaultRate).bankName(request.bankName()).accountNumber(request.accountNumber())
                .accountHolder(request.accountHolder()).transactionCode(request.transactionCode().trim()).note(request.note())
                .disbursedBy(actor).disbursedAt(LocalDateTime.now()).build();
        return historyRow(payments.saveAndFlush(payment));
    }

    private ResponseStatusException invalid(String message) { return new ResponseStatusException(HttpStatus.BAD_REQUEST, message); }
}
