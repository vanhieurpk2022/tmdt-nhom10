package com.nhom10.tmdt.service.payment;

import com.nhom10.tmdt.repo.*;
import com.nhom10.tmdt.config.VnPayProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.data.domain.PageRequest;
import java.time.Clock;

@Component @RequiredArgsConstructor @Slf4j
public class PaymentJobs {
    private final OrderRepository orders;
    private final PaymentAttemptRepository attempts;
    private final VnPayPaymentService payments;
    private final VnPayQueryService queries;
    private final RefundRepository refunds;
    private final VnPayRefundService refundPayments;
    private final VnPayProperties properties;
    private final Clock clock;
    private long queryCursor;
    private long refundCursor;

    @Scheduled(fixedDelayString = "${vnpay.sweep-delay-ms:60000}", initialDelayString = "${vnpay.sweep-delay-ms:60000}")
    public void sweep() {
        // Each item gets its own transaction; a failed row cannot roll back the batch.
        var page = PageRequest.of(0, 100);
        if (properties.isEnabled()) {
            var refundCandidates = refunds.findAwaitingReconciliationIds(clock.instant().minusSeconds(60),
                    refundCursor, PageRequest.of(0, 10));
            if (refundCandidates.isEmpty() && refundCursor != 0) {
                refundCursor = 0;
                refundCandidates = refunds.findAwaitingReconciliationIds(clock.instant().minusSeconds(60),
                        refundCursor, PageRequest.of(0, 10));
            }
            for (Long id : refundCandidates) {
                run("refund-query", id, () -> refundPayments.refresh(id));
                refundCursor = id;
            }
            var candidates = attempts.findAwaitingConfirmationIds(clock.instant().minusSeconds(VnPayQueryLimiter.INTERVAL_SECONDS),
                    properties.getTmnCode(), queryCursor, PageRequest.of(0, 10));
            if (candidates.isEmpty() && queryCursor != 0) {
                queryCursor = 0;
                candidates = attempts.findAwaitingConfirmationIds(clock.instant().minusSeconds(VnPayQueryLimiter.INTERVAL_SECONDS),
                        properties.getTmnCode(), queryCursor, PageRequest.of(0, 10));
            }
            for (Long id : candidates) {
                run("query", id, () -> queries.refreshAttempt(id));
                queryCursor = id;
            }
        }
        for (Long id : attempts.findUnresolvedIds(clock.instant(), page)) run("attempt", id, () -> payments.expireAttempt(id));
        for (Long id : orders.findExpiredIds(clock.instant(), page)) run("order", id, () -> payments.expireOrder(id));
    }
    private void run(String type, Long id, Runnable action) {
        try { action.run(); }
        catch (RuntimeException ex) { log.error("Payment job failed: type={}, id={}, error={}", type, id, ex.getClass().getSimpleName()); }
    }
}
