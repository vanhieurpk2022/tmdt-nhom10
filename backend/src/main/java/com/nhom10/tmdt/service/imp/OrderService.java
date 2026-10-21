package com.nhom10.tmdt.service.imp;

import com.nhom10.tmdt.dto.order.CreateOrderRequest;
import com.nhom10.tmdt.dto.order.OrderItemResponse;
import com.nhom10.tmdt.dto.order.OrderResponse;
import com.nhom10.tmdt.enums.OrderStatus;
import com.nhom10.tmdt.enums.PaymentMethod;
import com.nhom10.tmdt.enums.PaymentStatus;
import com.nhom10.tmdt.service.payment.InventoryReservationService;
import com.nhom10.tmdt.service.payment.VndMoney;
import com.nhom10.tmdt.service.payment.VnPayGateway;
import com.nhom10.tmdt.model.Address;
import com.nhom10.tmdt.model.CartItem;
import com.nhom10.tmdt.model.Order;
import com.nhom10.tmdt.model.OrderItem;
import com.nhom10.tmdt.model.Product;
import com.nhom10.tmdt.model.ProductImage;
import com.nhom10.tmdt.repo.AddressRepository;
import com.nhom10.tmdt.repo.CartItemRepository;
import com.nhom10.tmdt.repo.OrderItemRepository;
import com.nhom10.tmdt.repo.OrderRepository;
import com.nhom10.tmdt.repo.UserRepository;
import com.nhom10.tmdt.service.order.CheckoutIdentity;
import com.nhom10.tmdt.service.shipping.ShippingFeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.time.Instant;
import java.util.Objects;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final CartItemRepository cartItemRepository;
    private final AddressRepository addressRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ShippingFeeService shippingFeeService;
    private final PurchaseItemService purchaseItems;
    private final InventoryReservationService inventory;
    private final UserRepository userRepository;

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public OrderResponse createOrderFromCart(String email, CreateOrderRequest request, String key) {
        if (request.paymentMethod() != PaymentMethod.COD) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vui lòng tạo thanh toán qua /payments/vnpay/checkout");
        }
        CheckoutIdentity identity = CheckoutIdentity.from(key, request);
        userRepository.lockByEmail(email).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy tài khoản"));
        var existing = orderRepository.findByUserEmailAndCheckoutKey(email, key);
        if (existing.isPresent()) {
            identity.verify(existing.get());
            return response(existing.get());
        }
        Order order = placeOrder(email, request, key, identity.fingerprint(), null);
        return toResponse(order, order.getOrderItems());
    }

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public Order createVnpayOrder(String email, CreateOrderRequest request, String checkoutKey,
                                  String fingerprint, Instant holdUntil) {
        if (request.paymentMethod() != PaymentMethod.VNPAY || holdUntil == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Phương thức thanh toán không hợp lệ");
        }
        return placeOrder(email, request, checkoutKey, fingerprint, holdUntil);
    }

    private Order placeOrder(String email, CreateOrderRequest request, String checkoutKey,
                             String fingerprint, Instant holdUntil) {
        Address address = addressRepository.findByIdAndUserEmail(request.addressId(), email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy địa chỉ giao hàng"));

        if (request.buyNow() != null && request.cartItemIds() != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Chỉ chọn một hình thức đặt hàng");
        }
        List<CartItem> selectedCartItems = request.buyNow() != null
                ? List.of(purchaseItems.resolve(request.buyNow()))
                : purchaseItems.selectCartItems(email, request.cartItemIds());

        inventory.reserve(selectedCartItems);
        long subtotal = 0;
        for (CartItem item : selectedCartItems) {
            subtotal = Math.addExact(subtotal, Math.multiplyExact(VndMoney.exact(purchaseItems.price(item)), item.getQuantity()));
        }
        long shippingFee = VndMoney.exact((double) shippingFeeService.calculateFee(address, selectedCartItems, subtotal));
        long total = Math.addExact(subtotal, shippingFee);
        if (total <= 0 || total > VnPayGateway.MAX_AMOUNT_VND) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Số tiền đơn hàng vượt giới hạn thanh toán");
        }

        Order order = Order.builder()
                .user(address.getUser())
                .status(holdUntil == null ? OrderStatus.PENDING : OrderStatus.PENDING_PAYMENT)
                .paymentStatus(PaymentStatus.PENDING)
                .payableAmountVnd(total)
                .stockHeld(holdUntil != null)
                .reservationExpiresAt(holdUntil)
                .checkoutKey(checkoutKey)
                .checkoutFingerprint(fingerprint)
                .subtotalPrice((double) subtotal)
                .discountAmount(0.0)
                .shippingFee((double) shippingFee)
                .totalPrice((double) total)
                .paymentMethod(request.paymentMethod())
                .recipientName(address.getRecipentName())
                .phoneNumber(address.getPhoneNumber())
                .shippingAddress(formatShippingAddress(address))
                .note(normalizeNote(request.note()))
                .build();

        Order savedOrder = orderRepository.saveAndFlush(order);
        List<OrderItem> savedItems = orderItemRepository.saveAllAndFlush(selectedCartItems.stream()
                .map(item -> toOrderItem(savedOrder, item))
                .toList());
        savedOrder.setOrderItems(savedItems);

        if (request.buyNow() == null) cartItemRepository.deleteAll(selectedCartItems);

        return savedOrder;
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrder(String email, Long id) {
        Order order = orderRepository.findByIdAndUserEmail(id, email).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy đơn hàng"));
        return response(order);
    }

    @Transactional(readOnly = true)
    public OrderResponse recoverCheckout(String email, String key) {
        CheckoutIdentity.validateKey(key);
        Order order = orderRepository.findByUserEmailAndCheckoutKey(email, key).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy yêu cầu đặt hàng"));
        return response(order);
    }

    public OrderResponse response(Order order) { return toResponse(order, order.getOrderItems()); }

    private OrderItem toOrderItem(Order order, CartItem cartItem) {
        Product product = cartItem.getProduct();
        return OrderItem.builder()
                .order(order)
                .product(product)
                .productMil(purchaseItems.variant(cartItem))
                .quantity(cartItem.getQuantity())
                .unitPrice(purchaseItems.price(cartItem))
                .build();
    }

    private OrderResponse toResponse(Order order, List<OrderItem> items) {
        return new OrderResponse(
                order.getId(),
                order.getStatus(),
                order.getPaymentMethod(),
                order.getRecipientName(),
                order.getPhoneNumber(),
                order.getShippingAddress(),
                order.getNote(),
                valueOrZero(order.getSubtotalPrice()),
                valueOrZero(order.getShippingFee()),
                valueOrZero(order.getTotalPrice()),
                order.getCreatedAt(),
                items.stream().map(this::toItemResponse).toList(),
                order.getPaymentStatus()
        );
    }

    private OrderItemResponse toItemResponse(OrderItem item) {
        Product product = item.getProduct();
        double lineTotal = item.getUnitPrice() * item.getQuantity();
        return new OrderItemResponse(
                item.getId(),
                product.getId(),
                product.getName(),
                product.getFactory() != null ? product.getFactory().getName() : null,
                getThumbnailUrl(product),
                item.getQuantity(),
                item.getUnitPrice(),
                lineTotal,
                item.getProductMil() == null ? null : item.getProductMil().getId(),
                item.getProductMil() == null ? null : item.getProductMil().getMil()
        );
    }

    private String formatShippingAddress(Address address) {
        return String.join(", ", Stream.of(
                address.getStreet(),
                address.getWard(),
                address.getDistrict(),
                address.getCity()
        ).filter(value -> value != null && !value.isBlank()).toList());
    }

    private String normalizeNote(String note) {
        return note == null || note.isBlank() ? null : note.trim();
    }

    private String getThumbnailUrl(Product product) {
        if (product.getProductImages() == null || product.getProductImages().isEmpty()) {
            return null;
        }
        return product.getProductImages().stream()
                .map(ProductImage::getImageUrl)
                .filter(Objects::nonNull)
                .findFirst()
                .orElse(null);
    }

    private double valueOrZero(Double value) {
        return value == null ? 0 : value;
    }
}
