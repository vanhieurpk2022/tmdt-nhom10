package com.nhom10.tmdt.service.payment;

import com.nhom10.tmdt.config.VnPayProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.concurrent.Semaphore;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(propagation = Propagation.NOT_SUPPORTED)
public class VnPayRefundService {
    private final RefundService refunds;
    private final VnPayGatewayProvider gateways;
    private final VnPayProperties properties;
    private final VnPayApiClient api;
    private final VnPayQueryLimiter queryLimiter;
    private final Semaphore requests = new Semaphore(2);

    public RefundService.Summary process(Long id, String actor) {
        if (!requests.tryAcquire()) throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "VNPay đang bận, vui lòng thử lại");
        try {
            var gateway = gateways.gateway();
            VnPayApiClient.validateEndpoint(properties.getRefundUrl());
            var dispatch = refunds.prepare(id, actor, gateway);
            if (dispatch.isPresent()) {
                var claim = dispatch.get();
                try {
                    var result = api.post(properties.getRefundUrl(), claim.payload());
                    refunds.complete(claim, gateway.validateRefundResponse(result, claim.txnRef(), claim.amountVnd(), "refund"));
                } catch (InterruptedException ex) {
                    Thread.currentThread().interrupt();
                    refunds.uncertain(claim);
                } catch (IOException | RuntimeException ex) {
                    log.warn("VNPay refund requires reconciliation: refund={}, error={}", id, ex.getClass().getSimpleName());
                    refunds.uncertain(claim);
                }
            }
            return refunds.get(id);
        } finally {
            requests.release();
        }
    }

    public RefundService.Summary refresh(Long id) {
        var dispatch = refunds.reconciliation(id);
        if (dispatch.isEmpty() || !requests.tryAcquire()) return refunds.get(id);
        try {
            var claim = dispatch.get();
            if (!queryLimiter.claim(claim.txnRef())) return refunds.get(id);
            var gateway = gateways.gateway();
            var payload = gateway.buildQueryRequest(claim.txnRef(), claim.paymentCreatedAt(), properties.getServerIp());
            var result = api.post(properties.getQueryUrl(), payload);
            if ("00".equals(result.get("vnp_ResponseCode")) && "02".equals(result.get("vnp_TransactionType"))) {
                refunds.complete(claim, gateway.validateRefundResponse(result, claim.txnRef(), claim.amountVnd(), "querydr"));
            }
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
        } catch (IOException | RuntimeException ex) {
            log.warn("VNPay refund query unavailable: refund={}, error={}", id, ex.getClass().getSimpleName());
        } finally {
            requests.release();
        }
        return refunds.get(id);
    }
}
