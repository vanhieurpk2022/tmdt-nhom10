package com.nhom10.tmdt.service.payment;

import com.nhom10.tmdt.config.VnPayProperties;
import com.nhom10.tmdt.dto.order.*;
import com.nhom10.tmdt.enums.*;
import com.nhom10.tmdt.model.*;
import com.nhom10.tmdt.repo.*;
import com.nhom10.tmdt.service.imp.OrderService;
import com.nhom10.tmdt.service.order.CheckoutIdentity;
import lombok.RequiredArgsConstructor;
import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import java.time.*;
import java.time.temporal.ChronoUnit;
import java.util.*;

import static com.nhom10.tmdt.service.order.CheckoutIdentity.digest;
import static com.nhom10.tmdt.service.order.CheckoutIdentity.validateKey;

@Service
@RequiredArgsConstructor
public class VnPayPaymentService {
    private final OrderRepository orders;
    private final PaymentAttemptRepository attempts;
    private final PaymentEventRepository events;
    private final UserRepository users;
    private final PaymentRetryKeyRepository retryKeys;
    private final OrderService orderService;
    private final InventoryReservationService inventory;
    private final RefundService refunds;
    private final VnPayGatewayProvider gateways;
    private final VnPayProperties properties;
    private final Clock clock;
    private final EntityManager entityManager;

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public PaymentResponse checkout(String email, CreateOrderRequest request, String key, String ip) {
        CheckoutIdentity identity = CheckoutIdentity.from(key, request);
        if (request.paymentMethod() != PaymentMethod.VNPAY) throw bad("Vui lòng chọn phương thức VNPay");
        users.lockByEmail(email).orElseThrow(VnPayPaymentService::notFound);
        var existing = orders.findByUserEmailAndCheckoutKey(email, key);
        if (existing.isPresent()) {
            Order order = lockOrder(existing.get().getId());
            identity.verify(order);
            // Same checkout key never creates a new attempt, even after payment/expiry.
            PaymentAttempt attempt = attempts.findByOrderIdOrderByIdDesc(order.getId()).stream()
                    .findFirst().orElseThrow(() -> conflict("Đơn hàng cần được kiểm tra"));
            return response(order, attempt);
        }
        VnPayGateway gateway = gateways.gateway();
        Instant holdUntil = now().plusSeconds(1800);
        Order order = orderService.createVnpayOrder(email, request, key, identity.fingerprint(), holdUntil);
        return response(order, createAttempt(order, ip, gateway));
    }

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public PaymentResponse retry(String email, Long orderId, String key, String ip) {
        VnPayGateway gateway = gateways.gateway();
        validateKey(key);
        Order order = ownedLocked(email, orderId);
        List<PaymentAttempt> history = attempts.findByOrderIdOrderByIdDesc(orderId);
        if (history.stream().anyMatch(attempt -> "NEEDS_REVIEW".equals(attempt.getStatus()))) {
            throw conflict("Giao dịch đang được đối soát, chưa thể thanh toán lại");
        }
        var previous = retryKeys.findByOrderIdAndRequestKey(orderId, key);
        if (previous.isPresent()) return response(order, attempts.findById(previous.get().getAttemptId()).orElseThrow(VnPayPaymentService::notFound));
        if (!payable(order)) throw conflict("Đơn hàng không còn đủ điều kiện thanh toán");
        for (PaymentAttempt attempt : history) {
            if ("INITIATED".equals(attempt.getStatus())) {
                if (attempt.getExpiresAt().isAfter(now())) return retryResponse(order, attempt, key);
                attempt.setStatus("EXPIRED");
                event(order, attempt, "MISSING_IPN", "OPEN", "missing:" + attempt.getId());
            }
        }
        return retryResponse(order, createAttempt(order, ip, gateway), key);
    }

    private PaymentResponse retryResponse(Order order, PaymentAttempt attempt, String key) {
        retryKeys.save(PaymentRetryKey.builder().orderId(order.getId()).requestKey(key).attemptId(attempt.getId()).build());
        return response(order, attempt);
    }

    private PaymentAttempt createAttempt(Order order, String ip, VnPayGateway gateway) {
        if (!payable(order) || order.getPayableAmountVnd() == null) throw conflict("Đơn hàng không thể thanh toán");
        Instant created = now();
        Instant expires = created.plusSeconds(900).isBefore(order.getReservationExpiresAt())
                ? created.plusSeconds(900) : order.getReservationExpiresAt();
        String ref = VnPayGateway.newTxnRef();
        String url = gateway.buildPaymentUrl(new VnPayGateway.PaymentRequest(ref, order.getPayableAmountVnd(),
                "Thanh toan don hang " + order.getId(), ip, "vn", null, expires));
        PaymentAttempt attempt = attempts.saveAndFlush(PaymentAttempt.builder().orderId(order.getId())
                .provider("VNPAY").merchantCode(properties.getTmnCode()).txnRef(ref)
                .amountVnd(order.getPayableAmountVnd()).currency("VND").status("INITIATED")
                .createdAt(created).expiresAt(expires).paymentUrl(url).build());
        order.setPaymentStatus(PaymentStatus.PENDING);
        return attempt;
    }

    /** Called only after protocol validation, or by the audited ADMIN reconciliation endpoint. */
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public String apply(VnPayGateway.Callback callback) {
        PaymentAttempt found = attempts.findByTxnRef(callback.txnRef()).orElse(null);
        if (found == null) return "01";
        Order order = lockOrder(found.getOrderId()); // Always order before attempt.
        PaymentAttempt attempt = attempts.lockById(found.getId()).orElseThrow(VnPayPaymentService::notFound);
        entityManager.refresh(attempt, LockModeType.PESSIMISTIC_WRITE);
        if (!Objects.equals(order.getId(), attempt.getOrderId()) || !"VNPAY".equals(attempt.getProvider())
                || !"VND".equals(attempt.getCurrency()) || !callback.merchantCode().equals(attempt.getMerchantCode())
                || !callback.merchantCode().equals(properties.getTmnCode()) || order.getPaymentMethod() != PaymentMethod.VNPAY) return "97";
        if (callback.amountVnd() != attempt.getAmountVnd() || !Objects.equals(order.getPayableAmountVnd(), attempt.getAmountVnd())) {
            event(order, attempt, "AMOUNT_MISMATCH", "OPEN", "amount:" + attempt.getId() + ":" + callback.amountVnd());
            return "04";
        }
        String fingerprint = digest(callback.toString());
        if (fingerprint.equals(attempt.getCallbackFingerprint())) return "02";
        if ("SUCCESS".equals(attempt.getStatus())) {
            event(order, attempt, "CONFLICTING_CALLBACK", "OPEN", "conflict:" + attempt.getId() + ":" + fingerprint);
            return "00"; // Never overwrite a receipt with a later failure or conflicting receipt.
        }
        if (attempt.getCallbackFingerprint() != null) {
            event(order, attempt, "CONFLICTING_CALLBACK", "OPEN", "conflict:" + attempt.getId() + ":" + fingerprint);
        }
        attempt.setCallbackFingerprint(fingerprint);
        attempt.setReceivedAt(now());
        attempt.setResponseCode(callback.responseCode());
        attempt.setProviderTransactionStatus(callback.transactionStatus());
        attempt.setTransactionNo(callback.transactionNo());
        attempt.setBankCode(callback.bankCode());
        attempt.setPayDate(callback.payDate());

        if (callback.successful()) {
            attempt.setStatus("SUCCESS");
            boolean reusedReceipt = attempts.existsByMerchantCodeAndReceiptNoAndIdNot(
                    attempt.getMerchantCode(), callback.transactionNo(), attempt.getId());
            if (reusedReceipt) {
                event(order, attempt, "DUPLICATE_RECEIPT_NUMBER", "OPEN", "receipt:" + attempt.getId());
                // Keep the signed claim, but do not fulfill twice for one provider receipt.
                if (order.getPaidAttemptId() == null) order.setPaymentStatus(PaymentStatus.REFUND_PENDING);
            } else {
                attempt.setReceiptNo(callback.transactionNo());
                if (order.getPaidAttemptId() != null) {
                    event(order, attempt, "OVERPAYMENT", "OPEN", "overpaid:" + attempt.getId());
                    refunds.enqueue(order, attempt, "Hoàn khoản thanh toán thu dư", "SYSTEM");
                } else if (!payable(order)) {
                    order.setPaymentStatus(PaymentStatus.REFUND_PENDING);
                    event(order, attempt, "LATE_PAYMENT", "OPEN", "late:" + attempt.getId());
                    refunds.enqueue(order, attempt, "Hoàn khoản thanh toán đến muộn", "SYSTEM");
                } else {
                    order.setPaidAttemptId(attempt.getId());
                    order.setPaymentStatus(PaymentStatus.PAID);
                    order.setStatus(OrderStatus.PENDING);
                    order.setStockHeld(false); // Reservation consumed; no second deduction.
                    event(order, attempt, "ORDER_PAID", "RECORDED", "paid:" + order.getId());
                }
            }
        } else if (knownFailure(callback)) {
            attempt.setStatus("FAILED");
            if (order.getPaidAttemptId() == null && order.getPaymentStatus() != PaymentStatus.REFUND_PENDING
                    && order.getStatus() == OrderStatus.PENDING_PAYMENT
                    && attempts.findByOrderIdOrderByIdDesc(order.getId()).stream().noneMatch(a ->
                    !a.getId().equals(attempt.getId()) && ("SUCCESS".equals(a.getStatus())
                    || "NEEDS_REVIEW".equals(a.getStatus()) || ("INITIATED".equals(a.getStatus()) && a.getExpiresAt().isAfter(now()))))) {
                order.setPaymentStatus(PaymentStatus.FAILED);
            }
        } else {
            attempt.setStatus("NEEDS_REVIEW");
            event(order, attempt, "UNKNOWN_RESULT", "OPEN", "unknown:" + attempt.getId());
        }
        return "00"; // Spring commits before the controller can acknowledge.
    }

    private boolean knownFailure(VnPayGateway.Callback callback) {
        // PAY documentation: 02 failed, 03 processing, 04 reversal, 05 refund processing,
        // 06 refunded, 07 suspected fraud, 09 refund rejected. Ambiguous money states require review.
        return "02".equals(callback.transactionStatus())
                && Set.of("09", "10", "11", "12", "13", "24", "51", "65", "75", "79").contains(callback.responseCode());
    }

    @Transactional(readOnly = true)
    public PaymentStatusResponse status(String email, Long orderId, String ref) {
        Order order;
        if (ref != null) {
            PaymentAttempt attempt = attempts.findByTxnRef(ref).orElseThrow(VnPayPaymentService::notFound);
            order = orders.findByIdAndUserEmail(attempt.getOrderId(), email).orElseThrow(VnPayPaymentService::notFound);
        } else {
            order = orders.findByIdAndUserEmail(orderId, email).orElseThrow(VnPayPaymentService::notFound);
        }
        List<PaymentAttempt> list = attempts.findByOrderIdOrderByIdDesc(order.getId());
        String latest = list.isEmpty() ? null : list.getFirst().getStatus();
        boolean unknown = list.stream().anyMatch(a -> "NEEDS_REVIEW".equals(a.getStatus()));
        return new PaymentStatusResponse(order.getId(), order.getStatus(), order.getPaymentStatus(), latest,
                payable(order) && !unknown, unknown || order.getPaymentStatus() == PaymentStatus.REFUND_PENDING,
                order.getReservationExpiresAt(), list.isEmpty() ? null : list.getFirst().getTxnRef());
    }

    @Transactional(readOnly = true)
    public PaymentResponse recoverCheckout(String email, String key) {
        validateKey(key);
        Order order = orders.findByUserEmailAndCheckoutKey(email, key).orElseThrow(VnPayPaymentService::notFound);
        PaymentAttempt attempt = attempts.findByOrderIdOrderByIdDesc(order.getId()).stream()
                .findFirst().orElseThrow(VnPayPaymentService::notFound);
        return response(order, attempt);
    }

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public void expireOrder(Long id) {
        Order order = lockOrder(id);
        if (order.getStatus() != OrderStatus.PENDING_PAYMENT || order.getPaidAttemptId() != null
                || order.getReservationExpiresAt() == null || order.getReservationExpiresAt().isAfter(now())) return;
        List<PaymentAttempt> list = attempts.findByOrderIdOrderByIdDesc(id);
        // Unknown money outcome: preserve stock for an operator, never silently ship or release.
        if (list.stream().anyMatch(a -> "NEEDS_REVIEW".equals(a.getStatus()))) return;
        inventory.release(order);
        order.setStatus(OrderStatus.CANCELLED);
        order.setCancelledAt(now());
        order.setCancelledBy("SYSTEM");
        order.setCancellationNote("Hết thời hạn thanh toán");
        for (PaymentAttempt attempt : list) {
            if ("INITIATED".equals(attempt.getStatus())) {
                attempt.setStatus("EXPIRED");
                event(order, attempt, "MISSING_IPN", "OPEN", "missing:" + attempt.getId());
            }
        }
    }

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public void expireAttempt(Long id) {
        PaymentAttempt found = attempts.findById(id).orElseThrow(VnPayPaymentService::notFound);
        Order order = lockOrder(found.getOrderId());
        PaymentAttempt attempt = attempts.lockById(id).orElseThrow(VnPayPaymentService::notFound);
        entityManager.refresh(attempt, LockModeType.PESSIMISTIC_WRITE);
        if ("INITIATED".equals(attempt.getStatus()) && !attempt.getExpiresAt().isAfter(now())) {
            attempt.setStatus("EXPIRED");
            event(order, attempt, "MISSING_IPN", "OPEN", "missing:" + attempt.getId());
        }
    }

    void event(Order order, PaymentAttempt attempt, String type, String status, String key) {
        if (events.findLockedByEventKey(key).isEmpty()) events.save(PaymentEvent.builder().eventKey(key).orderId(order.getId())
                .attemptId(attempt == null ? null : attempt.getId()).type(type).status(status).createdAt(now()).build());
    }

    private PaymentResponse response(Order order, PaymentAttempt attempt) {
        boolean unknown = attempts.findByOrderIdOrderByIdDesc(order.getId()).stream()
                .anyMatch(item -> "NEEDS_REVIEW".equals(item.getStatus()));
        String url = payable(order) && "INITIATED".equals(attempt.getStatus()) && attempt.getExpiresAt().isAfter(now())
                && !unknown
                ? attempt.getPaymentUrl() : null;
        return new PaymentResponse(orderService.response(order), attempt.getTxnRef(), url, attempt.getExpiresAt());
    }
    private boolean payable(Order order) {
        return order.getPaymentMethod() == PaymentMethod.VNPAY && order.getStatus() == OrderStatus.PENDING_PAYMENT
                && order.getPaidAttemptId() == null && order.getPaymentStatus() != PaymentStatus.REFUND_PENDING
                && order.isStockHeld() && order.getStockRestoredAt() == null
                && order.getReservationExpiresAt() != null && order.getReservationExpiresAt().isAfter(now());
    }
    private Order lockOrder(Long id) {
        Order order = orders.lockById(id).orElseThrow(VnPayPaymentService::notFound);
        entityManager.refresh(order, LockModeType.PESSIMISTIC_WRITE);
        return order;
    }
    private Order ownedLocked(String email, Long id) {
        Order order = lockOrder(id);
        if (!email.equals(order.getUser().getEmail())) throw notFound();
        return order;
    }
    private Instant now() { return clock.instant().truncatedTo(ChronoUnit.SECONDS); }
    static ResponseStatusException notFound() { return new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy giao dịch/đơn hàng"); }
    static ResponseStatusException conflict(String message) { return new ResponseStatusException(HttpStatus.CONFLICT, message); }
    static ResponseStatusException bad(String message) { return new ResponseStatusException(HttpStatus.BAD_REQUEST, message); }
}
