package com.nhom10.tmdt.service.order;

import com.nhom10.tmdt.dto.order.OrderHistoryResponse;
import com.nhom10.tmdt.enums.OrderStatus;
import com.nhom10.tmdt.model.Order;
import com.nhom10.tmdt.model.OrderItem;
import com.nhom10.tmdt.repo.OrderRepository;
import com.nhom10.tmdt.service.imp.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class OrderHistoryService {
    private static final Map<String, List<OrderStatus>> STATUS_GROUPS = Map.of(
            "processing", List.of(OrderStatus.PENDING_PAYMENT, OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.PROCESSING),
            "shipping", List.of(OrderStatus.SHIPPED, OrderStatus.DELIVERING),
            "completed", List.of(OrderStatus.DELIVERED),
            "cancelled", List.of(OrderStatus.CANCELLED, OrderStatus.RETURNED, OrderStatus.REFUNDED));

    private final OrderRepository orders;
    private final OrderService orderService;

    @Transactional(readOnly = true)
    public OrderHistoryResponse list(String email, int page, String status, String search) {
        if (!"all".equals(status) && !STATUS_GROUPS.containsKey(status)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Bộ lọc trạng thái không hợp lệ");
        }
        String term = search == null ? "" : search.trim().toLowerCase(Locale.ROOT);
        if (term.length() > 150) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Từ khóa tìm kiếm quá dài");
        }
        Specification<Order> filter = (root, query, cb) -> cb.equal(root.get("user").get("email"), email);
        if (!"all".equals(status)) {
            filter = filter.and((root, query, cb) -> root.get("status").in(STATUS_GROUPS.get(status)));
        }
        if (!term.isEmpty()) {
            Long orderId = parseOrderId(term);
            String pattern = "%" + term.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_") + "%";
            filter = filter.and((root, query, cb) -> {
                var matchingItem = query.subquery(Long.class);
                var item = matchingItem.from(OrderItem.class);
                matchingItem.select(item.get("id")).where(cb.equal(item.get("order"), root),
                        cb.like(cb.lower(item.get("product").get("name")), pattern, '\\'));
                var productMatches = cb.exists(matchingItem);
                return orderId == null ? productMatches : cb.or(cb.equal(root.get("id"), orderId), productMatches);
            });
        }
        var result = orders.findAll(filter, PageRequest.of(Math.max(page, 0), 20, Sort.by(Sort.Direction.DESC, "id")));
        Map<String, Long> counts = new LinkedHashMap<>();
        counts.put("all", 0L);
        STATUS_GROUPS.keySet().forEach(key -> counts.put(key, 0L));
        for (var count : orders.countStatuses(email)) {
            counts.merge("all", count.getTotal(), Long::sum);
            STATUS_GROUPS.forEach((key, values) -> {
                if (values.contains(count.getStatus())) counts.merge(key, count.getTotal(), Long::sum);
            });
        }
        return new OrderHistoryResponse(result.stream().map(orderService::response).toList(), result.getNumber(),
                result.getTotalPages(), result.getTotalElements(), counts,
                new OrderHistoryResponse.Summary(counts.get("all"), counts.get("completed"), orders.totalSpent(email)));
    }

    private static Long parseOrderId(String term) {
        String digits = term.startsWith("olia-") ? term.substring(5) : term;
        if (!digits.matches("[0-9]+")) return null;
        try { return Long.valueOf(digits); }
        catch (NumberFormatException ex) { return null; }
    }
}
