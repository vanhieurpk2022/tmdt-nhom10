package com.nhom10.tmdt.service.payment;

import com.nhom10.tmdt.config.VnPayProperties;
import com.nhom10.tmdt.enums.OrderStatus;
import com.nhom10.tmdt.enums.PaymentMethod;
import com.nhom10.tmdt.enums.PaymentStatus;
import com.nhom10.tmdt.enums.RefundStatus;
import com.nhom10.tmdt.model.Order;
import com.nhom10.tmdt.model.PaymentAttempt;
import com.nhom10.tmdt.model.PaymentEvent;
import com.nhom10.tmdt.model.Refund;
import com.nhom10.tmdt.repo.OrderRepository;
import com.nhom10.tmdt.repo.PaymentAttemptRepository;
import com.nhom10.tmdt.repo.PaymentEventRepository;
import com.nhom10.tmdt.repo.RefundRepository;
import com.nhom10.tmdt.service.order.CheckoutIdentity;
import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;

import static com.nhom10.tmdt.service.payment.VnPayPaymentService.conflict;

@Service
@RequiredArgsConstructor
@Transactional(isolation = Isolation.READ_COMMITTED)
public class RefundService {
    private final RefundRepository refunds;
    private final OrderRepository orders;
    private final PaymentAttemptRepository attempts;
    private final PaymentEventRepository events;
    private final VnPayProperties properties;
    private final EntityManager entityManager;
    private final Clock clock;

    @Transactional(readOnly = true)
    public List<Summary> list(Long orderId, RefundStatus status, int page) {
        if (orderId != null) return refunds.findByOrderIdOrderByIdAsc(orderId).stream().map(Summary::from).toList();
        return refunds.findByStatusOrderByIdAsc(status, PageRequest.of(Math.max(0, page), 50))
                .stream().map(Summary::from).toList();
    }

    @Transactional(readOnly = true)
    public Summary get(Long id) {
        return Summary.from(refunds.findById(id).orElseThrow(VnPayPaymentService::notFound));
    }

    public Summary request(Long attemptId, String key, String reason, String actor) {
        CheckoutIdentity.validateKey(key);
        PaymentAttempt found = attempts.findById(attemptId).orElseThrow(VnPayPaymentService::notFound);
        Order order = lockOrder(found.getOrderId());
        PaymentAttempt attempt = lockAttempt(attemptId);
        Refund previous = refunds.findByOrderIdAndRequestKey(order.getId(), key).orElse(null);
        if (previous != null) {
            if (!attemptId.equals(previous.getPaymentAttemptId()) || !reason.equals(previous.getReason())) {
                throw conflict("Mã yêu cầu đã dùng cho nội dung hoàn tiền khác");
            }
            return Summary.from(previous);
        }
        return Summary.from(create(order, attempt, key, reason, actor));
    }

    @Transactional(propagation = Propagation.MANDATORY)
    public void enqueue(Order order, PaymentAttempt attempt, String reason, String actor) {
        String key = "auto_refund_" + attempt.getId();
        if (refunds.findByOrderIdAndRequestKey(order.getId(), key).isEmpty() && !hasReservation(order, attempt)) {
            create(order, attempt, key, reason, actor);
        }
    }

    private Refund create(Order order, PaymentAttempt attempt, String key, String reason, String actor) {
        validateCapture(order, attempt);
        if (hasReservation(order, attempt)) throw conflict("Giao dịch đã có yêu cầu hoàn tiền hoặc dữ liệu cũ cần đối soát");
        Refund refund = refunds.saveAndFlush(Refund.builder().order(order).paymentAttemptId(attempt.getId())
                .amountVnd(attempt.getAmountVnd()).requestKey(key).reason(reason).requestedBy(actor).build());
        audit(refund, "REQUESTED", "RECORDED", reason, actor);
        updatePaymentStatus(order);
        return refund;
    }

    public Summary decide(Long id, boolean approve, String evidence, String actor) {
        validateEvidence(evidence);
        Refund refund = lock(id);
        RefundStatus target = approve ? RefundStatus.APPROVED : RefundStatus.REJECTED;
        if (refund.getStatus() == target) return Summary.from(refund);
        if (refund.getStatus() != RefundStatus.REQUESTED) throw conflict("Yêu cầu không còn chờ duyệt");
        if (approve) validateCapture(refund.getOrder(), lockAttempt(refund.getPaymentAttemptId()));
        refund.setStatus(target);
        refund.setApprovedBy(actor);
        refund.setApprovedAt(clock.instant());
        audit(refund, target.name(), "RECORDED", evidence, actor);
        return Summary.from(refund);
    }

    public Optional<Dispatch> prepare(Long id, String actor, VnPayGateway gateway) {
        Refund refund = lock(id);
        if (refund.getStatus() != RefundStatus.APPROVED) return Optional.empty();
        PaymentAttempt attempt = lockAttempt(refund.getPaymentAttemptId());
        validateCapture(refund.getOrder(), attempt);
        if (!Objects.equals(refund.getAmountVnd(), attempt.getAmountVnd()) || refund.getProviderRequestId() != null) {
            throw conflict("Số tiền hoặc trạng thái gửi hoàn tiền không hợp lệ");
        }
        String requestId = VnPayGateway.newTxnRef();
        Instant now = clock.instant();
        Map<String, String> payload = gateway.buildRefundRequest(requestId, attempt.getTxnRef(),
                refund.getAmountVnd(), attempt.getReceiptNo(), attempt.getCreatedAt(), actor, now, properties.getServerIp());
        refund.setProviderRequestId(requestId);
        refund.setProviderRequestedAt(now);
        refund.setProcessedBy(actor);
        refund.setStatus(RefundStatus.PROCESSING);
        audit(refund, "SUBMITTED", "RECORDED", "Đã lưu mã yêu cầu trước khi gửi VNPay", actor);
        return Optional.of(new Dispatch(id, requestId, attempt.getTxnRef(), refund.getAmountVnd(),
                attempt.getCreatedAt(), payload));
    }

    @Transactional(readOnly = true)
    public Optional<Dispatch> reconciliation(Long id) {
        Refund refund = refunds.findById(id).orElseThrow(VnPayPaymentService::notFound);
        if (!pending(refund) || refund.getProviderRequestId() == null) return Optional.empty();
        PaymentAttempt attempt = attempts.findById(refund.getPaymentAttemptId()).orElseThrow(VnPayPaymentService::notFound);
        if (!Objects.equals(attempt.getMerchantCode(), properties.getTmnCode())) return Optional.empty();
        boolean otherSubmission = refunds.findByOrderIdOrderByIdAsc(refund.getOrder().getId()).stream()
                .anyMatch(r -> !r.getId().equals(id) && Objects.equals(r.getPaymentAttemptId(), attempt.getId())
                        && r.getProviderRequestId() != null);
        if (otherSubmission) return Optional.empty();
        return Optional.of(new Dispatch(id, refund.getProviderRequestId(), attempt.getTxnRef(),
                refund.getAmountVnd(), attempt.getCreatedAt(), Map.of()));
    }

    public void complete(Dispatch dispatch, VnPayGateway.RefundResult result) {
        Refund refund = lock(dispatch.id());
        if (!pending(refund) || !dispatch.requestId().equals(refund.getProviderRequestId())) return;
        refund.setProviderResponseId(result.responseId());
        refund.setProviderTransactionNo(result.transactionNo());
        refund.setProviderResponseCode(result.responseCode());
        refund.setProviderTransactionStatus(result.transactionStatus());
        finish(refund, resultStatus(result), "VNPay: " + result.responseCode() + "/" + result.transactionStatus(), "VNPAY");
    }

    static RefundStatus resultStatus(VnPayGateway.RefundResult result) {
        if ("00".equals(result.responseCode())) {
            return switch (result.transactionStatus()) {
                case "00" -> RefundStatus.SUCCEEDED;
                case "05", "06" -> RefundStatus.PROCESSING;
                case "09" -> RefundStatus.FAILED;
                default -> RefundStatus.NEEDS_REVIEW;
            };
        }
        return Set.of("02", "03", "04", "13", "91", "93", "95", "97").contains(result.responseCode())
                ? RefundStatus.FAILED : RefundStatus.NEEDS_REVIEW;
    }

    public void uncertain(Dispatch dispatch) {
        Refund refund = lock(dispatch.id());
        if (!pending(refund) || !dispatch.requestId().equals(refund.getProviderRequestId())) return;
        finish(refund, RefundStatus.NEEDS_REVIEW, "Chưa xác minh được kết quả VNPay; cần đối soát, không gửi lại yêu cầu hoàn tiền", "SYSTEM");
    }

    public Summary reconcile(Long id, String requestId, RefundStatus status, String transactionNo,
            String evidence, String actor) {
        validateEvidence(evidence);
        if (status != RefundStatus.SUCCEEDED && status != RefundStatus.FAILED) {
            throw VnPayPaymentService.bad("Chỉ ghi nhận kết quả hoàn thành hoặc thất bại có bằng chứng");
        }
        Refund refund = lock(id);
        if (!requestId.equals(refund.getProviderRequestId())) throw conflict("Mã yêu cầu VNPay không khớp");
        if (refund.getStatus() == status && Objects.equals(transactionNo, refund.getProviderTransactionNo())) {
            return Summary.from(refund);
        }
        if (!pending(refund)) throw conflict("Chỉ được đối soát yêu cầu đã gửi và chưa có kết quả cuối cùng");
        refund.setProviderTransactionNo(transactionNo);
        refund.setProcessedBy(actor);
        finish(refund, status, evidence, actor);
        return Summary.from(refund);
    }

    private void finish(Refund refund, RefundStatus status, String note, String actor) {
        refund.setStatus(status);
        refund.setLastError(status == RefundStatus.NEEDS_REVIEW ? note : null);
        if (status == RefundStatus.SUCCEEDED || status == RefundStatus.FAILED) {
            refund.setProcessedAt(LocalDateTime.ofInstant(clock.instant(), ZoneOffset.UTC));
        }
        audit(refund, status.name(), status == RefundStatus.FAILED || status == RefundStatus.NEEDS_REVIEW
                ? "OPEN" : "RECORDED", note, actor);
        if (status == RefundStatus.SUCCEEDED) {
            updatePaymentStatus(refund.getOrder());
            resolveMoneyReviews(refund);
        }
    }

    private void validateCapture(Order order, PaymentAttempt attempt) {
        if (order.getPaymentMethod() != PaymentMethod.VNPAY || !order.getId().equals(attempt.getOrderId())
                || !"VNPAY".equals(attempt.getProvider()) || !"VND".equals(attempt.getCurrency())
                || !Objects.equals(properties.getTmnCode(), attempt.getMerchantCode())
                || !"SUCCESS".equals(attempt.getStatus()) || attempt.getReceiptNo() == null
                || !attempt.getReceiptNo().matches("[0-9]{1,15}")
                || new java.math.BigInteger(attempt.getReceiptNo()).signum() <= 0
                || !attempt.getReceiptNo().equals(attempt.getTransactionNo())
                || (attempt.getId().equals(order.getPaidAttemptId()) && order.getStatus() != OrderStatus.CANCELLED)) {
            throw conflict("Chỉ hoàn giao dịch VNPay đã thu tiền hợp lệ của đơn đã hủy, thanh toán muộn hoặc thu dư");
        }
        VnPayGateway.wireAmount(attempt.getAmountVnd());
    }

    private boolean hasReservation(Order order, PaymentAttempt attempt) {
        return refunds.findByOrderIdOrderByIdAsc(order.getId()).stream()
                .anyMatch(r -> (r.getPaymentAttemptId() == null || attempt.getId().equals(r.getPaymentAttemptId()))
                        && r.getStatus() != RefundStatus.REJECTED && r.getStatus() != RefundStatus.FAILED);
    }

    private void validateEvidence(String evidence) {
        if (evidence == null || evidence.trim().length() < 20 || evidence.length() > 500) {
            throw VnPayPaymentService.bad("Bằng chứng xử lý phải có 20–500 ký tự");
        }
    }

    private Refund lock(Long id) {
        Refund found = refunds.findById(id).orElseThrow(VnPayPaymentService::notFound);
        lockOrder(found.getOrder().getId());
        Refund refund = refunds.lockById(id).orElseThrow(VnPayPaymentService::notFound);
        entityManager.refresh(refund, LockModeType.PESSIMISTIC_WRITE);
        return refund;
    }

    private Order lockOrder(Long id) {
        Order order = orders.lockById(id).orElseThrow(VnPayPaymentService::notFound);
        entityManager.refresh(order, LockModeType.PESSIMISTIC_WRITE);
        return order;
    }

    private PaymentAttempt lockAttempt(Long id) {
        if (id == null) throw conflict("Yêu cầu hoàn tiền cũ chưa có giao dịch VNPay để xác minh");
        PaymentAttempt attempt = attempts.lockById(id).orElseThrow(VnPayPaymentService::notFound);
        entityManager.refresh(attempt, LockModeType.PESSIMISTIC_WRITE);
        return attempt;
    }

    private boolean pending(Refund refund) {
        return refund.getStatus() == RefundStatus.PROCESSING || refund.getStatus() == RefundStatus.NEEDS_REVIEW;
    }

    private void updatePaymentStatus(Order order) {
        if (order.getPaidAttemptId() != null && order.getStatus() != OrderStatus.CANCELLED) return;
        List<PaymentAttempt> captures = attempts.findByOrderIdOrderByIdDesc(order.getId()).stream()
                .filter(a -> "SUCCESS".equals(a.getStatus())).toList();
        List<Refund> history = refunds.findByOrderIdOrderByIdAsc(order.getId());
        boolean allRefunded = !captures.isEmpty() && captures.stream().allMatch(a -> a.getReceiptNo() != null
                && history.stream().anyMatch(r -> a.getId().equals(r.getPaymentAttemptId())
                && Objects.equals(r.getAmountVnd(), a.getAmountVnd()) && r.getStatus() == RefundStatus.SUCCEEDED));
        order.setPaymentStatus(allRefunded ? PaymentStatus.REFUNDED : PaymentStatus.REFUND_PENDING);
    }

    private void audit(Refund refund, String action, String status, String note, String actor) {
        String key = "refund:" + refund.getId() + ":" + action;
        if (!events.existsByEventKey(key)) {
            events.save(PaymentEvent.builder().eventKey(key).orderId(refund.getOrder().getId())
                    .attemptId(refund.getPaymentAttemptId()).type("REFUND_" + action).status(status)
                    .createdAt(clock.instant()).resolutionNote(note).resolvedBy(actor).build());
        }
    }

    private void resolveMoneyReviews(Refund refund) {
        for (PaymentEvent event : events.findByAttemptIdAndStatusOrderByIdAsc(refund.getPaymentAttemptId(), "OPEN")) {
            if (Set.of("ORDER_CANCELLED", "LATE_PAYMENT", "OVERPAYMENT", "REFUND_NEEDS_REVIEW", "REFUND_FAILED")
                    .contains(event.getType())) {
                event.setStatus("RESOLVED");
                event.setResolvedAt(clock.instant());
                event.setResolvedBy(refund.getProcessedBy());
                event.setResolutionNote("Đã hoàn tiền, yêu cầu #" + refund.getId() + ", giao dịch " + refund.getProviderTransactionNo());
            }
        }
    }

    public record Dispatch(Long id, String requestId, String txnRef, long amountVnd, Instant paymentCreatedAt,
                           Map<String, String> payload) {}

    public record Summary(Long id, Long orderId, Long paymentAttemptId, long amountVnd, String reason,
            RefundStatus status, String requestedBy, String approvedBy, String processedBy,
            String providerRequestId, String providerTransactionNo, String providerResponseCode,
            String providerTransactionStatus, String lastError, LocalDateTime createdAt, Instant approvedAt,
            Instant providerRequestedAt, LocalDateTime processedAt) {
        static Summary from(Refund r) {
            return new Summary(r.getId(), r.getOrder().getId(), r.getPaymentAttemptId(), r.getAmountVnd(),
                    r.getReason(), r.getStatus(), r.getRequestedBy(), r.getApprovedBy(), r.getProcessedBy(),
                    r.getProviderRequestId(), r.getProviderTransactionNo(), r.getProviderResponseCode(),
                    r.getProviderTransactionStatus(), r.getLastError(), r.getCreatedAt(), r.getApprovedAt(),
                    r.getProviderRequestedAt(), r.getProcessedAt());
        }
    }
}
