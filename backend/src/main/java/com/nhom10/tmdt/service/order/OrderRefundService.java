package com.nhom10.tmdt.service.order;

import com.nhom10.tmdt.dto.order.OrderRefundResponse;
import com.nhom10.tmdt.repo.OrderRepository;
import com.nhom10.tmdt.repo.RefundRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderRefundService {
    private final OrderRepository orders;
    private final RefundRepository refunds;

    @Transactional(readOnly = true)
    public List<OrderRefundResponse> list(String email, Long orderId) {
        orders.findByIdAndUserEmail(orderId, email).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy đơn hàng"));
        return refunds.findByOrderIdOrderByIdAsc(orderId).stream()
                .map(refund -> new OrderRefundResponse(refund.getId(), refund.getAmountVnd(), refund.getReason(),
                        refund.getStatus(), refund.getCreatedAt(), refund.getProcessedAt() == null
                                ? null : refund.getProcessedAt().toInstant(java.time.ZoneOffset.UTC)))
                .toList();
    }
}
