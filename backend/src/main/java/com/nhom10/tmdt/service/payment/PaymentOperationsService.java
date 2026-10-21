package com.nhom10.tmdt.service.payment;

import com.nhom10.tmdt.model.*;
import com.nhom10.tmdt.repo.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.data.domain.PageRequest;
import java.time.Clock;
import java.util.List;
import static com.nhom10.tmdt.service.order.CheckoutIdentity.digest;

@Service
@RequiredArgsConstructor
public class PaymentOperationsService {
    private final PaymentEventRepository events;
    private final PaymentAttemptRepository attempts;
    private final OrderRepository orders;
    private final VnPayPaymentService payments;
    private final Clock clock;

    @Transactional(readOnly = true)
    public List<PaymentEvent> reviews(int page) {
        return events.findByStatusOrderByIdAsc("OPEN", PageRequest.of(Math.max(page, 0), 50));
    }

    @Transactional(readOnly = true)
    public List<AttemptSummary> attempts(Long orderId) {
        return attempts.findByOrderIdOrderByIdDesc(orderId).stream().map(a -> new AttemptSummary(a.getId(),
                a.getTxnRef(), a.getAmountVnd(), a.getStatus(), a.getResponseCode(),
                a.getProviderTransactionStatus(), a.getTransactionNo())).toList();
    }
    public record AttemptSummary(Long id, String txnRef, long amountVnd, String status,
            String responseCode, String providerTransactionStatus, String transactionNo) {}

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public void resolve(Long eventId, String evidence, String actor) {
        PaymentEvent event = events.lockById(eventId).orElseThrow(VnPayPaymentService::notFound);
        if (!"OPEN".equals(event.getStatus())) throw VnPayPaymentService.conflict("Yêu cầu đã được xử lý");
        event.setStatus("RESOLVED");
        event.setResolutionNote(evidence);
        event.setResolvedBy(actor);
        event.setResolvedAt(clock.instant());
        // Acknowledges external investigation only; does not pretend to refund money.
    }

    /** Explicit operator evidence from merchant portal, never a fake querydr API response. */
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public String reconcile(Long attemptId, String responseCode, String transactionStatus, String transactionNo, String bankCode,
                            String payDate, String evidence, String actor) {
        PaymentAttempt found = attempts.findById(attemptId).orElseThrow(VnPayPaymentService::notFound);
        Order order = orders.lockById(found.getOrderId()).orElseThrow(VnPayPaymentService::notFound);
        PaymentAttempt attempt = attempts.lockById(attemptId).orElseThrow(VnPayPaymentService::notFound);
        String result = payments.apply(new VnPayGateway.Callback(attempt.getTxnRef(), attempt.getMerchantCode(),
                attempt.getAmountVnd(), responseCode, transactionStatus, transactionNo, bankCode, payDate));
        if (!"00".equals(result) && !"02".equals(result)) throw VnPayPaymentService.conflict("Không thể ghi nhận đối soát: " + result);
        String key = "manual:" + attemptId + ":" + digest(responseCode + ":" + transactionStatus + ":" + transactionNo + ":" + evidence);
        if (!events.existsByEventKey(key)) events.save(PaymentEvent.builder().eventKey(key).orderId(order.getId())
                .attemptId(attemptId).type("MANUAL_RECONCILIATION").status("RESOLVED")
                .createdAt(clock.instant()).resolvedAt(clock.instant()).resolutionNote(evidence).resolvedBy(actor).build());
        return result;
    }
}
