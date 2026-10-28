package com.nhom10.tmdt.service.order;

import com.nhom10.tmdt.dto.order.CancelOrderRequest;
import com.nhom10.tmdt.dto.order.OrderResponse;
import com.nhom10.tmdt.enums.OrderStatus;
import com.nhom10.tmdt.enums.PaymentMethod;
import com.nhom10.tmdt.enums.PaymentStatus;
import com.nhom10.tmdt.model.Order;
import com.nhom10.tmdt.model.PaymentAttempt;
import com.nhom10.tmdt.model.PaymentEvent;
import com.nhom10.tmdt.repo.OrderRepository;
import com.nhom10.tmdt.repo.PaymentAttemptRepository;
import com.nhom10.tmdt.repo.PaymentEventRepository;
import com.nhom10.tmdt.service.imp.OrderService;
import com.nhom10.tmdt.service.payment.InventoryReservationService;
import com.nhom10.tmdt.service.payment.RefundService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Clock;
import java.time.temporal.ChronoUnit;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class OrderCancellationService {
    private final OrderRepository orders;
    private final PaymentAttemptRepository attempts;
    private final PaymentEventRepository events;
    private final InventoryReservationService inventory;
    private final OrderService orderService;
    private final RefundService refunds;
    private final EntityManager entityManager;
    private final Clock clock;

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public OrderResponse cancel(String email, Long id, CancelOrderRequest request) {
        Order order = orders.lockById(id).orElseThrow(OrderCancellationService::notFound);
        entityManager.refresh(order, LockModeType.PESSIMISTIC_WRITE);
        if (!email.equals(order.getUser().getEmail())) throw notFound();
        if (order.getStatus() == OrderStatus.CANCELLED) return orderService.response(order);
        if ((order.getStatus() != OrderStatus.PENDING_PAYMENT && order.getStatus() != OrderStatus.PENDING)
                || order.getStockRestoredAt() != null) {
            throw conflict("Chỉ được hủy đơn đang chờ thanh toán hoặc chờ xác nhận");
        }

        PaymentAttempt paid = validatePayment(order);
        inventory.restore(order);
        order.setStatus(OrderStatus.CANCELLED);
        order.setCancelReason(request.reason());
        order.setCancelledAt(clock.instant().truncatedTo(ChronoUnit.MICROS));
        order.setCancelledBy(email);
        order.setCancellationNote(request.note() == null || request.note().isBlank() ? null : request.note().trim());
        if (paid != null) {
            order.setPaymentStatus(PaymentStatus.REFUND_PENDING);
            events.save(PaymentEvent.builder().eventKey("cancel:" + id).orderId(id).attemptId(paid.getId())
                    .type("ORDER_CANCELLED").status("OPEN").createdAt(clock.instant()).build());
            refunds.enqueue(order, paid, "Hoàn tiền đơn hàng đã hủy", email);
        }
        return orderService.response(order);
    }

    private PaymentAttempt validatePayment(Order order) {
        if (order.getPaymentMethod() == PaymentMethod.COD && order.getStatus() == OrderStatus.PENDING
                && order.getPaidAttemptId() == null && !order.isStockHeld()
                && (order.getPaymentStatus() == null || order.getPaymentStatus() == PaymentStatus.PENDING)) {
            return null;
        }
        if (order.getPaymentMethod() != PaymentMethod.VNPAY) {
            throw conflict("Trạng thái thanh toán cần được kiểm tra trước khi hủy đơn");
        }
        var history = attempts.findByOrderIdOrderByIdDesc(order.getId());
        if (history.stream().anyMatch(attempt -> "NEEDS_REVIEW".equals(attempt.getStatus()))) {
            throw conflict("Giao dịch đang đối soát, vui lòng chờ xác nhận trước khi hủy đơn");
        }
        if (order.getStatus() == OrderStatus.PENDING_PAYMENT && order.getPaidAttemptId() == null
                && order.isStockHeld() && order.getReservationExpiresAt() != null
                && (order.getPaymentStatus() == PaymentStatus.PENDING || order.getPaymentStatus() == PaymentStatus.FAILED)
                && history.stream().noneMatch(attempt -> "SUCCESS".equals(attempt.getStatus()))) {
            return null;
        }
        if (order.getStatus() == OrderStatus.PENDING && order.getPaymentStatus() == PaymentStatus.PAID
                && order.getPaidAttemptId() != null && !order.isStockHeld()) {
            return history.stream().filter(attempt -> order.getPaidAttemptId().equals(attempt.getId())
                    && "SUCCESS".equals(attempt.getStatus()) && "VNPAY".equals(attempt.getProvider())
                    && "VND".equals(attempt.getCurrency()) && attempt.getReceiptNo() != null
                    && !attempt.getReceiptNo().isBlank()
                    && Objects.equals(order.getPayableAmountVnd(), attempt.getAmountVnd()))
                    .findFirst().orElseThrow(() -> conflict("Không tìm thấy giao dịch đã thanh toán hợp lệ"));
        }
        throw conflict("Trạng thái thanh toán cần được kiểm tra trước khi hủy đơn");
    }

    private static ResponseStatusException notFound() {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy đơn hàng");
    }

    private static ResponseStatusException conflict(String message) {
        return new ResponseStatusException(HttpStatus.CONFLICT, message);
    }
}
