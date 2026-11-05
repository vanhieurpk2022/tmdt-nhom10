package com.nhom10.tmdt.service.payment;

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
import java.util.Objects;
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
    private final EntityManager entityManager;
    private final Clock clock;

    @Transactional(readOnly = true)
    public List<Summary> list(Long orderId, RefundStatus status, int page) {
        if (orderId != null) return refunds.findByOrderIdOrderByIdAsc(orderId).stream().map(Summary::from).toList();
        var pageable = PageRequest.of(Math.max(0, page), 50);
        List<Refund> result = status == null ? refunds.findAllByOrderByIdDesc(pageable)
                : refunds.findByStatusInOrderByIdDesc(status == RefundStatus.APPROVED
                ? List.of(RefundStatus.APPROVED, RefundStatus.PROCESSING, RefundStatus.NEEDS_REVIEW)
                : List.of(status), pageable);
        return result.stream().map(Summary::from).toList();
    }

    @Transactional(readOnly = true)
    public Summary get(Long id) {
        return Summary.from(refunds.findById(id).orElseThrow(VnPayPaymentService::notFound));
    }

    @Transactional(propagation = Propagation.MANDATORY)
    public void enqueue(Order order, PaymentAttempt attempt, String reason, String actor) {
        String key = "auto_refund_" + attempt.getId();
        if (refunds.findByOrderIdAndRequestKey(order.getId(), key).isPresent() || hasReservation(order, attempt, null)) return;
        validateCapture(order, attempt);
        Refund refund = refunds.saveAndFlush(Refund.builder().order(order).paymentAttemptId(attempt.getId())
                .amountVnd(attempt.getAmountVnd()).requestKey(key).reason(reason).requestedBy(actor).build());
        audit(refund, "REQUESTED", reason, actor);
        updatePaymentStatus(order);
    }

    public Summary approve(Long id, String actor) {
        Refund refund = lock(id);
        if (refund.getStatus() == RefundStatus.APPROVED) return Summary.from(refund);
        if (refund.getStatus() != RefundStatus.REQUESTED && refund.getStatus() != RefundStatus.FAILED) {
            throw conflict("Yêu cầu không còn chờ duyệt hoàn tiền");
        }
        validateRefund(refund);
        refund.setStatus(RefundStatus.APPROVED);
        refund.setApprovedBy(actor);
        refund.setApprovedAt(clock.instant());
        refund.setProcessedBy(null);
        refund.setProcessedAt(null);
        refund.setLastError(null);
        audit(refund, "APPROVED", "Quản trị viên duyệt yêu cầu hoàn tiền", actor);
        return Summary.from(refund);
    }

    public Summary complete(Long id, boolean succeeded, String note, String actor) {
        Refund refund = lock(id);
        RefundStatus target = succeeded ? RefundStatus.SUCCEEDED : RefundStatus.FAILED;
        if (refund.getStatus() == target) return Summary.from(refund);
        if (!Set.of(RefundStatus.APPROVED, RefundStatus.PROCESSING, RefundStatus.NEEDS_REVIEW).contains(refund.getStatus())) {
            throw conflict("Cần duyệt yêu cầu trước khi xác nhận kết quả hoàn tiền");
        }
        validateRefund(refund);
        finish(refund, target, note, actor);
        if (succeeded) resolveMoneyReviews(refund);
        return Summary.from(refund);
    }

    public Summary reject(Long id, String note, String actor) {
        Refund refund = lock(id);
        if (refund.getStatus() == RefundStatus.REJECTED) return Summary.from(refund);
        if (refund.getStatus() != RefundStatus.REQUESTED) throw conflict("Chỉ từ chối yêu cầu đang chờ duyệt");
        finish(refund, RefundStatus.REJECTED, note, actor);
        return Summary.from(refund);
    }

    private void finish(Refund refund, RefundStatus status, String note, String actor) {
        String text = note == null ? "" : note.trim();
        if (text.length() > 500) throw VnPayPaymentService.bad("Ghi chú không quá 500 ký tự");
        if (text.isEmpty()) text = switch (status) {
            case SUCCEEDED -> "Quản trị viên xác nhận đã hoàn tiền cho khách";
            case FAILED -> "Chưa hoàn tiền được cho khách";
            default -> "Quản trị viên từ chối yêu cầu hoàn tiền";
        };
        refund.setStatus(status);
        refund.setProcessedBy(actor);
        refund.setProcessedAt(LocalDateTime.ofInstant(clock.instant(), ZoneOffset.UTC));
        refund.setLastError(text);
        audit(refund, status.name(), text, actor);
        updatePaymentStatus(refund.getOrder());
    }

    private void validateRefund(Refund refund) {
        PaymentAttempt attempt = lockAttempt(refund.getPaymentAttemptId());
        validateCapture(refund.getOrder(), attempt);
        if (!Objects.equals(refund.getAmountVnd(), attempt.getAmountVnd())
                || hasReservation(refund.getOrder(), attempt, refund.getId())) {
            throw conflict("Số tiền không khớp hoặc giao dịch đã có yêu cầu hoàn tiền khác");
        }
    }

    private void validateCapture(Order order, PaymentAttempt attempt) {
        if (order.getPaymentMethod() != PaymentMethod.VNPAY || !order.getId().equals(attempt.getOrderId())
                || !"VNPAY".equals(attempt.getProvider()) || !"VND".equals(attempt.getCurrency())
                || !"SUCCESS".equals(attempt.getStatus()) || attempt.getReceiptNo() == null
                || !attempt.getReceiptNo().matches("[0-9]{1,15}")
                || new java.math.BigInteger(attempt.getReceiptNo()).signum() <= 0
                || !attempt.getReceiptNo().equals(attempt.getTransactionNo()) || attempt.getAmountVnd() <= 0
                || (attempt.getId().equals(order.getPaidAttemptId()) && order.getStatus() != OrderStatus.CANCELLED)) {
            throw conflict("Chỉ hoàn khoản VNPay đã thu của đơn đã hủy, thanh toán muộn hoặc thu dư");
        }
    }

    private boolean hasReservation(Order order, PaymentAttempt attempt, Long excludingId) {
        return refunds.findByOrderIdOrderByIdAsc(order.getId()).stream()
                .anyMatch(r -> !Objects.equals(r.getId(), excludingId)
                        && (r.getPaymentAttemptId() == null || attempt.getId().equals(r.getPaymentAttemptId()))
                        && r.getStatus() != RefundStatus.REJECTED && r.getStatus() != RefundStatus.FAILED);
    }

    private Refund lock(Long id) {
        Refund found = refunds.findById(id).orElseThrow(VnPayPaymentService::notFound);
        Order order = orders.lockById(found.getOrder().getId()).orElseThrow(VnPayPaymentService::notFound);
        entityManager.refresh(order, LockModeType.PESSIMISTIC_WRITE);
        Refund refund = refunds.lockById(id).orElseThrow(VnPayPaymentService::notFound);
        entityManager.refresh(refund, LockModeType.PESSIMISTIC_WRITE);
        return refund;
    }

    private PaymentAttempt lockAttempt(Long id) {
        if (id == null) throw conflict("Yêu cầu chưa có thông tin khoản thanh toán VNPay đã thu");
        PaymentAttempt attempt = attempts.lockById(id).orElseThrow(VnPayPaymentService::notFound);
        entityManager.refresh(attempt, LockModeType.PESSIMISTIC_WRITE);
        return attempt;
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

    private void audit(Refund refund, String action, String note, String actor) {
        events.save(PaymentEvent.builder().eventKey("refund:" + refund.getId() + ":" + refund.getVersion() + ":" + action)
                .orderId(refund.getOrder().getId()).attemptId(refund.getPaymentAttemptId())
                .type("REFUND_" + action).status("RECORDED").createdAt(clock.instant())
                .resolutionNote(note).resolvedBy(actor).build());
    }

    private void resolveMoneyReviews(Refund refund) {
        for (PaymentEvent event : events.findByAttemptIdAndStatusOrderByIdAsc(refund.getPaymentAttemptId(), "OPEN")) {
            if (Set.of("ORDER_CANCELLED", "LATE_PAYMENT", "OVERPAYMENT", "REFUND_NEEDS_REVIEW", "REFUND_FAILED")
                    .contains(event.getType())) {
                event.setStatus("RESOLVED");
                event.setResolvedAt(clock.instant());
                event.setResolvedBy(refund.getProcessedBy());
                event.setResolutionNote("Quản trị viên xác nhận đã hoàn tiền, yêu cầu #" + refund.getId());
            }
        }
    }

    public record Summary(Long id, Long orderId, String recipientName, String phoneNumber, OrderStatus orderStatus,
            Instant cancelledAt, long amountVnd, String reason, RefundStatus status, String approvedBy,
            String processedBy, String note, LocalDateTime createdAt, Instant approvedAt, Instant processedAt) {
        static Summary from(Refund r) {
            Order order = r.getOrder();
            return new Summary(r.getId(), order.getId(), order.getRecipientName(), order.getPhoneNumber(),
                    order.getStatus(), order.getCancelledAt(), r.getAmountVnd(), r.getReason(), r.getStatus(),
                    r.getApprovedBy(), r.getProcessedBy(), r.getProcessedAt() == null ? null : r.getLastError(),
                    r.getCreatedAt(), r.getApprovedAt(),
                    r.getProcessedAt() == null ? null : r.getProcessedAt().toInstant(ZoneOffset.UTC));
        }
    }
}
