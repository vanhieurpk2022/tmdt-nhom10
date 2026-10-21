package com.nhom10.tmdt.service.payment;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nhom10.tmdt.config.VnPayProperties;
import com.nhom10.tmdt.dto.order.PaymentStatusResponse;
import com.nhom10.tmdt.enums.PaymentStatus;
import com.nhom10.tmdt.model.PaymentAttempt;
import com.nhom10.tmdt.repo.PaymentAttemptRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
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
    private final ObjectMapper mapper = new ObjectMapper();
    private final HttpClient client = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(3)).build();
    private final Semaphore requests = new Semaphore(2);
    private final Map<String, Instant> lastQueries = new HashMap<>();

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

    private void refresh(PaymentAttempt attempt) {
        if (!properties.isEnabled() || !"VNPAY".equals(attempt.getProvider())
                || !attempt.getMerchantCode().equals(properties.getTmnCode())
                || "SUCCESS".equals(attempt.getStatus()) || "FAILED".equals(attempt.getStatus())
                || attempt.getCreatedAt().plusSeconds(5).isAfter(clock.instant())) return;
        if (!requests.tryAcquire()) return;
        try {
            if (!claim(attempt.getTxnRef())) return;
            URI endpoint = properties.getQueryUrl();
            if (endpoint == null || !"https".equals(endpoint.getScheme()) || endpoint.getHost() == null
                    || endpoint.getRawUserInfo() != null || endpoint.getRawQuery() != null
                    || endpoint.getRawFragment() != null) throw new IllegalArgumentException("Invalid QueryDR URL");
            var gateway = gateways.gateway();
            var payload = gateway.buildQueryRequest(attempt.getTxnRef(), attempt.getCreatedAt(), "127.0.0.1");
            HttpRequest request = HttpRequest.newBuilder(endpoint).timeout(Duration.ofSeconds(6))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(mapper.writeValueAsString(payload))).build();
            // No database transaction or row lock is held while waiting for VNPay.
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() != 200 || response.body().length() > 65_536) return;
            Map<String, String> result = mapper.readValue(response.body(), new TypeReference<>() {});
            if (result == null) return;
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

    private synchronized boolean claim(String ref) {
        Instant now = clock.instant();
        lastQueries.entrySet().removeIf(entry -> entry.getValue().plusSeconds(60).isBefore(now));
        if (lastQueries.size() >= 1024 || lastQueries.containsKey(ref)) return false;
        lastQueries.put(ref, now);
        return true;
    }
}
