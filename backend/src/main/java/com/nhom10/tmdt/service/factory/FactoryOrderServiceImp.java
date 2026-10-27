package com.nhom10.tmdt.service.factory;

import com.nhom10.tmdt.dto.admin.*;
import com.nhom10.tmdt.enums.*;
import com.nhom10.tmdt.model.*;
import com.nhom10.tmdt.repo.FactoryRepository;
import com.nhom10.tmdt.repo.OrderRepository;
import com.nhom10.tmdt.repo.UserRepository;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional
public class FactoryOrderServiceImp implements FactoryOrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final FactoryRepository factoryRepository;

    private Long resolveFactoryId(UserDetails userDetails) {
        if (userDetails != null && userDetails.getUsername() != null) {
            Optional<User> userOpt = userRepository.findByEmail(userDetails.getUsername());
            if (userOpt.isPresent() && userOpt.get().getFactory() != null) {
                return userOpt.get().getFactory().getId();
            }
        }
        // Fallback for development / unlinked factory account
        return factoryRepository.findAll().stream()
                .map(Factory::getId)
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy xưởng sản xuất"));
    }

    @Override
    @Transactional(readOnly = true)
    public AdminOrderPageResponse getOrders(UserDetails userDetails, int page, int size, String search, OrderStatus status, String sortBy, String sortDir) {
        Long factoryId = resolveFactoryId(userDetails);

        String safeSort = (sortBy == null || sortBy.isBlank()) ? "createdAt" : sortBy;
        Sort.Direction direction = "asc".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size), Sort.by(direction, safeSort));

        Specification<Order> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Đơn hàng phải chứa sản phẩm của factory này
            Join<Order, OrderItem> orderItemJoin = root.join("orderItems", JoinType.INNER);
            Join<OrderItem, Product> productJoin = orderItemJoin.join("product", JoinType.INNER);
            Join<Product, Factory> factoryJoin = productJoin.join("factory", JoinType.INNER);
            predicates.add(cb.equal(factoryJoin.get("id"), factoryId));

            if (query != null) {
                query.distinct(true);
            }

            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            if (search != null && !search.trim().isEmpty()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                List<Predicate> searchPreds = new ArrayList<>();

                searchPreds.add(cb.like(cb.lower(root.get("recipientName")), pattern));
                searchPreds.add(cb.like(cb.lower(root.get("phoneNumber")), pattern));
                searchPreds.add(cb.like(cb.lower(root.get("shippingAddress")), pattern));

                Join<Order, User> userJoin = root.join("user", JoinType.LEFT);
                searchPreds.add(cb.like(cb.lower(userJoin.get("fullname")), pattern));
                searchPreds.add(cb.like(cb.lower(userJoin.get("email")), pattern));

                try {
                    Long searchId = Long.parseLong(search.trim().replace("#", "").replace("ORD-", "").replace("DH-", ""));
                    searchPreds.add(cb.equal(root.get("id"), searchId));
                } catch (NumberFormatException ignored) {}

                predicates.add(cb.or(searchPreds.toArray(new Predicate[0])));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Order> orderPage = orderRepository.findAll(spec, pageable);

        List<AdminOrderListItemResponse> items = orderPage.getContent().stream()
                .map(this::mapToListItem)
                .toList();

        return AdminOrderPageResponse.builder()
                .content(items)
                .pageNo(orderPage.getNumber())
                .pageSize(orderPage.getSize())
                .totalElements(orderPage.getTotalElements())
                .totalPages(orderPage.getTotalPages())
                .isLast(orderPage.isLast())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public AdminOrderStatsResponse getOrderStats(UserDetails userDetails) {
        Long factoryId = resolveFactoryId(userDetails);

        List<Object[]> rows = orderRepository.countOrdersGroupByStatus(factoryId);
        long total = 0;
        long pending = 0;
        long processing = 0;
        long delivering = 0;
        long delivered = 0;
        long cancelled = 0;

        for (Object[] r : rows) {
            if (r[0] != null) {
                OrderStatus st = (OrderStatus) r[0];
                long cnt = ((Number) r[1]).longValue();
                total += cnt;
                if (st == OrderStatus.PENDING) pending += cnt;
                else if (st == OrderStatus.PROCESSING || st == OrderStatus.CONFIRMED) processing += cnt;
                else if (st == OrderStatus.DELIVERING || st == OrderStatus.SHIPPED) delivering += cnt;
                else if (st == OrderStatus.DELIVERED) delivered += cnt;
                else if (st == OrderStatus.CANCELLED) cancelled += cnt;
            }
        }

        long revenue = orderRepository.sumRevenueByFactoryId(factoryId, LocalDateTime.of(2000, 1, 1, 0, 0));

        return AdminOrderStatsResponse.builder()
                .totalOrders(total)
                .pendingCount(pending)
                .processingCount(processing)
                .deliveringCount(delivering)
                .deliveredCount(delivered)
                .cancelledCount(cancelled)
                .totalRevenue((double) revenue)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public AdminOrderDetailResponse getOrderDetail(UserDetails userDetails, Long id) {
        Long factoryId = resolveFactoryId(userDetails);

        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy đơn hàng với ID: " + id));

        // Kiểm tra quyền: đơn hàng có sản phẩm thuộc factory không
        boolean belongsToFactory = order.getOrderItems() != null && order.getOrderItems().stream()
                .anyMatch(it -> it.getProduct() != null && it.getProduct().getFactory() != null
                        && it.getProduct().getFactory().getId().equals(factoryId));

        if (!belongsToFactory) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không có quyền xem đơn hàng này");
        }

        return mapToDetail(order);
    }

    @Override
    public AdminOrderDetailResponse updateOrderStatus(UserDetails userDetails, Long id, UpdateOrderStatusRequest request) {
        Long factoryId = resolveFactoryId(userDetails);

        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy đơn hàng với ID: " + id));

        boolean belongsToFactory = order.getOrderItems() != null && order.getOrderItems().stream()
                .anyMatch(it -> it.getProduct() != null && it.getProduct().getFactory() != null
                        && it.getProduct().getFactory().getId().equals(factoryId));

        if (!belongsToFactory) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không có quyền cập nhật đơn hàng này");
        }

        if (request.getStatus() != null) {
            order.setStatus(request.getStatus());
            if (request.getStatus() == OrderStatus.DELIVERED) {
                order.setDeliveredAt(LocalDateTime.now());
            } else if (request.getStatus() == OrderStatus.CANCELLED) {
                order.setCancelReason(request.getCancelReason() != null ? request.getCancelReason() : CancelReason.CUSTOMER_CHANGED_MIND);
            }
        }

        if (request.getNote() != null && !request.getNote().isBlank()) {
            String existingNote = order.getNote() != null ? order.getNote() + " | " : "";
            order.setNote(existingNote + request.getNote().trim());
        }

        Order saved = orderRepository.save(order);
        return mapToDetail(saved);
    }

    @Override
    public void deleteOrder(UserDetails userDetails, Long id) {
        Long factoryId = resolveFactoryId(userDetails);

        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy đơn hàng với ID: " + id));

        boolean belongsToFactory = order.getOrderItems() != null && order.getOrderItems().stream()
                .anyMatch(it -> it.getProduct() != null && it.getProduct().getFactory() != null
                        && it.getProduct().getFactory().getId().equals(factoryId));

        if (!belongsToFactory) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không có quyền hủy đơn hàng này");
        }

        order.setStatus(OrderStatus.CANCELLED);
        order.setCancelReason(CancelReason.CUSTOMER_CHANGED_MIND);
        orderRepository.save(order);
    }

    private AdminOrderListItemResponse mapToListItem(Order order) {
        User u = order.getUser();
        List<OrderItem> items = order.getOrderItems();

        String summary = "Đơn hàng #" + order.getId();
        ProductType pType = ProductType.NORMAL;
        int count = 0;

        if (items != null && !items.isEmpty()) {
            count = items.size();
            OrderItem first = items.get(0);
            if (first.getProduct() != null) {
                summary = first.getProduct().getName() != null ? first.getProduct().getName() : "Sản phẩm #" + first.getProduct().getId();
                pType = first.getProduct().getProductType() != null ? first.getProduct().getProductType() : ProductType.NORMAL;
                if (count > 1) {
                    summary += " (+" + (count - 1) + " sản phẩm khác)";
                }
            }
        }

        return AdminOrderListItemResponse.builder()
                .id(order.getId())
                .code("#ORD-" + order.getId())
                .userId(u != null ? u.getId() : null)
                .customerName(u != null ? (u.getFullname() != null ? u.getFullname() : u.getUsername()) : "Khách vãng lai")
                .customerEmail(u != null ? u.getEmail() : "")
                .customerPhone(u != null ? u.getPhone() : "")
                .productSummary(summary)
                .productType(pType)
                .itemCount(count > 0 ? count : 1)
                .totalPrice(order.getTotalPrice() != null ? order.getTotalPrice() : 0.0)
                .shippingFee(order.getShippingFee() != null ? order.getShippingFee() : 0.0)
                .discountAmount(order.getDiscountAmount() != null ? order.getDiscountAmount() : 0.0)
                .status(order.getStatus())
                .paymentStatus(order.getPaymentStatus())
                .paymentMethod(order.getPaymentMethod())
                .recipientName(order.getRecipientName())
                .phoneNumber(order.getPhoneNumber())
                .shippingAddress(order.getShippingAddress())
                .createdAt(order.getCreatedAt())
                .deliveredAt(order.getDeliveredAt())
                .build();
    }

    private AdminOrderDetailResponse mapToDetail(Order order) {
        User u = order.getUser();

        AdminOrderDetailResponse.UserSummary userSummary = AdminOrderDetailResponse.UserSummary.builder()
                .id(u != null ? u.getId() : null)
                .name(u != null ? (u.getFullname() != null ? u.getFullname() : u.getUsername()) : "Khách vãng lai")
                .email(u != null ? u.getEmail() : "")
                .phone(u != null ? u.getPhone() : "")
                .build();

        AdminOrderDetailResponse.RecipientSummary recipientSummary = AdminOrderDetailResponse.RecipientSummary.builder()
                .name(order.getRecipientName())
                .phone(order.getPhoneNumber())
                .address(order.getShippingAddress())
                .build();

        List<AdminOrderDetailResponse.OrderItemSummary> itemSummaries = Optional.ofNullable(order.getOrderItems())
                .orElse(Collections.emptyList())
                .stream()
                .map(it -> {
                    Product p = it.getProduct();
                    String imgUrl = null;
                    if (p != null && p.getProductImages() != null && !p.getProductImages().isEmpty()) {
                        imgUrl = p.getProductImages().stream()
                                .filter(ProductImage::isThumbnail)
                                .map(ProductImage::getImageUrl)
                                .findFirst()
                                .orElse(p.getProductImages().get(0).getImageUrl());
                    }

                    Factory f = p != null ? p.getFactory() : null;

                    return AdminOrderDetailResponse.OrderItemSummary.builder()
                            .id(it.getId())
                            .productId(p != null ? p.getId() : null)
                            .productName(p != null ? p.getName() : "Sản phẩm")
                            .productImage(imgUrl)
                            .productType(p != null ? p.getProductType() : ProductType.NORMAL)
                            .volumeMl(it.getProductMil() != null ? (double) it.getProductMil().getMil() : 10.0)
                            .quantity(it.getQuantity())
                            .unitPrice(it.getUnitPrice())
                            .totalPrice(it.getUnitPrice() * it.getQuantity())
                            .factoryId(f != null ? f.getId() : null)
                            .factoryName(f != null ? f.getName() : "Xưởng gia công")
                            .build();
                })
                .toList();

        List<String> vouchers = Optional.ofNullable(order.getVouchers())
                .orElse(Collections.emptyList())
                .stream()
                .map(Voucher::getCode)
                .toList();

        List<AdminCustomerRefundSummary> refunds = Optional.ofNullable(order.getRefunds())
                .orElse(Collections.emptyList())
                .stream()
                .map(r -> AdminCustomerRefundSummary.builder()
                        .id(r.getId())
                        .orderId(order.getId())
                        .reason(r.getReason())
                        .status(r.getStatus())
                        .amount(r.getAmount())
                        .createdAt(r.getCreatedAt())
                        .processedAt(r.getProcessedAt())
                        .build())
                .toList();

        return AdminOrderDetailResponse.builder()
                .id(order.getId())
                .code("#ORD-" + order.getId())
                .createdAt(order.getCreatedAt())
                .deliveredAt(order.getDeliveredAt())
                .expectedDeliveryAt(order.getExpectedDeliveryAt())
                .status(order.getStatus())
                .paymentStatus(order.getPaymentStatus())
                .paymentMethod(order.getPaymentMethod())
                .subtotalPrice(order.getSubtotalPrice())
                .shippingFee(order.getShippingFee())
                .discountAmount(order.getDiscountAmount())
                .totalPrice(order.getTotalPrice())
                .note(order.getNote())
                .cancelReason(order.getCancelReason())
                .user(userSummary)
                .recipient(recipientSummary)
                .items(itemSummaries)
                .vouchers(vouchers)
                .refunds(refunds)
                .build();
    }
}
