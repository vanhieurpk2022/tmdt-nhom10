package com.nhom10.tmdt.service.admin;

import com.nhom10.tmdt.dto.admin.*;
import com.nhom10.tmdt.enums.*;
import com.nhom10.tmdt.model.*;
import com.nhom10.tmdt.repo.*;
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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminOrderServiceImp implements AdminOrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final FactoryRepository factoryRepository;
    private final RefundRepository refundRepository;

    @Override
    @Transactional(readOnly = true)
    public AdminOrderPageResponse getOrders(int page, int size, String search, OrderStatus status, String sortBy, String sortDir) {
        String safeSort = (sortBy == null || sortBy.isBlank()) ? "createdAt" : sortBy;
        Sort.Direction direction = "asc".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size), Sort.by(direction, safeSort));

        Specification<Order> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            if (search != null && !search.trim().isEmpty()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                List<Predicate> searchPreds = new ArrayList<>();

                searchPreds.add(cb.like(cb.lower(root.get("recipientName")), pattern));
                searchPreds.add(cb.like(cb.lower(root.get("phoneNumber")), pattern));
                searchPreds.add(cb.like(cb.lower(root.get("shippingAddress")), pattern));

                // Join with User
                Join<Order, User> userJoin = root.join("user", JoinType.LEFT);
                searchPreds.add(cb.like(cb.lower(userJoin.get("fullname")), pattern));
                searchPreds.add(cb.like(cb.lower(userJoin.get("email")), pattern));

                // If numeric, search ID
                try {
                    Long searchId = Long.parseLong(search.trim().replace("#", "").replace("ORD-", ""));
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
    public AdminOrderStatsResponse getOrderStats() {
        long total = orderRepository.count();
        long pending = orderRepository.countByStatus(OrderStatus.PENDING);
        long processing = orderRepository.countByStatus(OrderStatus.PROCESSING) + orderRepository.countByStatus(OrderStatus.CONFIRMED);
        long delivering = orderRepository.countByStatus(OrderStatus.DELIVERING) + orderRepository.countByStatus(OrderStatus.SHIPPED);
        long delivered = orderRepository.countByStatus(OrderStatus.DELIVERED);
        long cancelled = orderRepository.countByStatus(OrderStatus.CANCELLED);
        Double revenue = orderRepository.sumTotalRevenue();

        return AdminOrderStatsResponse.builder()
                .totalOrders(total)
                .pendingCount(pending)
                .processingCount(processing)
                .deliveringCount(delivering)
                .deliveredCount(delivered)
                .cancelledCount(cancelled)
                .totalRevenue(revenue != null ? revenue : 0.0)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public AdminOrderDetailResponse getOrderDetail(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy đơn hàng với ID: " + id));

        return mapToDetail(order);
    }

    @Override
    public AdminOrderDetailResponse updateOrderStatus(Long id, UpdateOrderStatusRequest request) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy đơn hàng với ID: " + id));

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
    public AdminOrderDetailResponse createDispatchOrder(AdminCreateDispatchOrderRequest request) {
        User user = null;
        if (request.getUserId() != null) {
            user = userRepository.findById(request.getUserId()).orElse(null);
        }
        if (user == null) {
            user = userRepository.findAll().stream().findFirst()
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Hệ thống chưa có người dùng nào để gán đơn"));
        }

        Product product = null;
        if (request.getProductId() != null) {
            product = productRepository.findById(request.getProductId()).orElse(null);
        }
        if (product == null) {
            product = productRepository.findAll().stream().findFirst()
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Hệ thống chưa có sản phẩm nào"));
        }

        int qty = (request.getQuantity() != null && request.getQuantity() > 0) ? request.getQuantity() : 1;
        double unitPrice = request.getUnitPrice() != null ? request.getUnitPrice() : (product.getPrice() != null ? product.getPrice() : 800000.0);
        double shipping = request.getShippingFee() != null ? request.getShippingFee() : 35000.0;
        double discount = request.getDiscountAmount() != null ? request.getDiscountAmount() : 35000.0;
        double subtotal = unitPrice * qty;
        double total = Math.max(0.0, subtotal + shipping - discount);

        Order order = Order.builder()
                .user(user)
                .recipientName(request.getRecipientName() != null ? request.getRecipientName() : user.getFullname())
                .phoneNumber(request.getPhoneNumber() != null ? request.getPhoneNumber() : user.getPhone())
                .shippingAddress(request.getShippingAddress() != null ? request.getShippingAddress() : "Hà Nội, Việt Nam")
                .note(request.getNote() != null ? request.getNote() : "Đơn gia công điều phối xưởng")
                .status(OrderStatus.PENDING)
                .paymentMethod(PaymentMethod.COD)
                .paymentStatus(PaymentStatus.PENDING)
                .subtotalPrice(subtotal)
                .shippingFee(shipping)
                .discountAmount(discount)
                .totalPrice(total)
                .payableAmountVnd(Math.round(total))
                .checkoutKey("DISPATCH-" + UUID.randomUUID())
                .createdAt(LocalDateTime.now())
                .build();

        Order savedOrder = orderRepository.save(order);

        OrderItem orderItem = OrderItem.builder()
                .order(savedOrder)
                .product(product)
                .quantity(qty)
                .unitPrice(unitPrice)
                .build();

        orderItemRepository.save(orderItem);

        savedOrder.setOrderItems(new ArrayList<>(List.of(orderItem)));
        return mapToDetail(savedOrder);
    }

    @Override
    public void deleteOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy đơn hàng với ID: " + id));

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
                            .scentTier(p != null ? p.getScentTier() : null)
                            .volumeMl(it.getProductMil() != null ? (double) it.getProductMil().getMil() : 10.0)
                            .quantity(it.getQuantity())
                            .unitPrice(it.getUnitPrice())
                            .totalPrice(it.getUnitPrice() * it.getQuantity())
                            .factoryId(f != null ? f.getId() : null)
                            .factoryName(f != null ? f.getName() : "OILIA Lab")
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
