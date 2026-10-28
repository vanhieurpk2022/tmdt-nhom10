package com.nhom10.tmdt.service.payment;

import com.nhom10.tmdt.config.VnPayProperties;
import com.nhom10.tmdt.dto.order.PaymentStatusResponse;
import com.nhom10.tmdt.enums.PaymentStatus;
import com.nhom10.tmdt.model.PaymentAttempt;
import com.nhom10.tmdt.repo.PaymentAttemptRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.Clock;
import java.util.concurrent.Semaphore;

@Service
@RequiredArgsConstructor
@Slf4j
public class VnPayQueryService {
    private final VnPayGatewayProvider gateways;
    private final VnPayProperties properties;
    private final VnPayPaymentService payments;
    private final PaymentAttemptRepository attempts;
    private final Clock clock;
    private final VnPayApiClient api;
    private final VnPayQueryLimiter queryLimiter;
    private final Semaphore requests = new Semaphore(2);

    public PaymentStatusResponse status(String email, Long orderId, String ref) {
        // Authorize ownership before any provider lookup or state change.
        PaymentStatusResponse current = payments.status(email, orderId, ref);
        if (current.paymentStatus() == PaymentStatus.PAID || current.paymentStatus() == PaymentStatus.REFUND_PENDING) {
            return current;
        }
        String reference = ref == null ? current.txnRef() : ref;
        if (reference != null) attempts.findByTxnRef(reference)
                .filter(attempt -> attempt.getOrderId().equals(current.orderId())).ifPresent(this::refresh);
        return payments.status(email, orderId, ref);
    }

    public void refreshAttempt(Long id) {
        attempts.findById(id).ifPresent(this::refresh);
    }

    public void refreshReturned(VnPayGateway.Callback callback) {
        attempts.findByTxnRef(callback.txnRef())
                .filter(attempt -> callback.merchantCode().equals(attempt.getMerchantCode())
                        && callback.amountVnd() == attempt.getAmountVnd())
                .ifPresent(this::refresh);
    }

    private void refresh(PaymentAttempt attempt) {
        if (!properties.isEnabled() || !"VNPAY".equals(attempt.getProvider())
                || !attempt.getMerchantCode().equals(properties.getTmnCode())
                || "SUCCESS".equals(attempt.getStatus()) || "FAILED".equals(attempt.getStatus())
                || attempt.getCreatedAt().plusSeconds(5).isAfter(clock.instant())) return;
        if (!requests.tryAcquire()) return;
        try {
            if (!queryLimiter.claim(attempt.getTxnRef())) return;
            var gateway = gateways.gateway();
            var payload = gateway.buildQueryRequest(attempt.getTxnRef(), attempt.getCreatedAt(), properties.getServerIp());
            var result = api.post(properties.getQueryUrl(), payload);
            if (!"00".equals(result.get("vnp_ResponseCode"))) {
                log.info("VNPay QueryDR pending: attempt={}, responseCode={}", attempt.getId(), result.get("vnp_ResponseCode"));
            }
            gateway.validateQueryResponse(result, attempt.getTxnRef(), attempt.getAmountVnd()).ifPresent(callback -> {
                String code = payments.apply(callback);
                log.info("VNPay QueryDR reconciled: attempt={}, result={}", attempt.getId(), code);
            });
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
        } catch (IOException | RuntimeException ex) {
            // A lookup failure is not proof of failed payment; retain the existing status for IPN/retry.
            log.warn("VNPay QueryDR unavailable: attempt={}, error={}", attempt.getId(), ex.getClass().getSimpleName());
        } finally {
            requests.release();
        }
    }

}
