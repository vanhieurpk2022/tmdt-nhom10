package com.nhom10.tmdt.service.imp;

import com.nhom10.tmdt.dto.order.CreateOrderRequest;
import com.nhom10.tmdt.dto.order.OrderItemResponse;
import com.nhom10.tmdt.dto.order.OrderResponse;
import com.nhom10.tmdt.enums.OrderStatus;
import com.nhom10.tmdt.model.Address;
import com.nhom10.tmdt.model.Cart;
import com.nhom10.tmdt.model.CartItem;
import com.nhom10.tmdt.model.Order;
import com.nhom10.tmdt.model.OrderItem;
import com.nhom10.tmdt.model.Product;
import com.nhom10.tmdt.model.ProductImage;
import com.nhom10.tmdt.model.ProductMil;
import com.nhom10.tmdt.repo.AddressRepository;
import com.nhom10.tmdt.repo.CartItemRepository;
import com.nhom10.tmdt.repo.CartRepository;
import com.nhom10.tmdt.repo.OrderItemRepository;
import com.nhom10.tmdt.repo.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Objects;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class OrderService {

    private static final double DEFAULT_SHIPPING_FEE = 25_000.0;

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final AddressRepository addressRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;

    @Transactional
    public OrderResponse createOrderFromCart(String email, CreateOrderRequest request) {
        Cart cart = cartRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Giỏ hàng đang trống"));

        List<CartItem> cartItems = cartItemRepository.findByCartIdOrderByIdAsc(cart.getId());
        if (cartItems.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Giỏ hàng đang trống");
        }

        Address address = addressRepository.findByIdAndUserEmail(request.addressId(), email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy địa chỉ giao hàng"));

        cartItems.forEach(this::validateCartItem);

        double subtotal = cartItems.stream()
                .mapToDouble(item -> resolvePrice(item.getProduct()) * item.getQuantity())
                .sum();
        double discountAmount = 0.0;
        double total = Math.max(subtotal - discountAmount, 0) + DEFAULT_SHIPPING_FEE;

        Order order = Order.builder()
                .user(cart.getUser())
                .status(OrderStatus.PENDING)
                .subtotalPrice(subtotal)
                .discountAmount(discountAmount)
                .shippingFee(DEFAULT_SHIPPING_FEE)
                .totalPrice(total)
                .paymentMethod(request.paymentMethod())
                .recipientName(address.getRecipentName())
                .phoneNumber(address.getPhoneNumber())
                .shippingAddress(formatShippingAddress(address))
                .note(normalizeNote(request.note()))
                .build();

        Order savedOrder = orderRepository.saveAndFlush(order);
        List<OrderItem> savedItems = orderItemRepository.saveAllAndFlush(cartItems.stream()
                .map(item -> toOrderItem(savedOrder, item))
                .toList());
        savedOrder.setOrderItems(savedItems);

        cartItemRepository.deleteAllByCartUserEmail(email);

        return toResponse(savedOrder, savedItems);
    }

    private void validateCartItem(CartItem item) {
        Product product = item.getProduct();
        double price = resolvePrice(product);
        int stockQuantity = getStockQuantity(product);

        if (price <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Sản phẩm chưa có giá hợp lệ");
        }
        if (stockQuantity <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, product.getName() + " đã hết hàng");
        }
        if (item.getQuantity() > stockQuantity) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, product.getName() + " vượt quá tồn kho");
        }
    }

    private OrderItem toOrderItem(Order order, CartItem cartItem) {
        Product product = cartItem.getProduct();
        return OrderItem.builder()
                .order(order)
                .product(product)
                .quantity(cartItem.getQuantity())
                .unitPrice(resolvePrice(product))
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
                valueOrZero(order.getDiscountAmount()),
                valueOrZero(order.getShippingFee()),
                valueOrZero(order.getTotalPrice()),
                order.getCreatedAt(),
                items.stream().map(this::toItemResponse).toList()
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
                lineTotal
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

    private double resolvePrice(Product product) {
        if (product.getPrice() != null && product.getPrice() > 0) {
            return product.getPrice();
        }
        return valueOrZero(minProductMilPrice(product));
    }

    private Double minProductMilPrice(Product product) {
        if (product.getProductMils() == null || product.getProductMils().isEmpty()) {
            return null;
        }
        return product.getProductMils().stream()
                .filter(ProductMil::isActive)
                .map(ProductMil::getPrice)
                .filter(Objects::nonNull)
                .filter(price -> price > 0)
                .min(Double::compareTo)
                .orElse(null);
    }

    private int getStockQuantity(Product product) {
        if (product.getProductMils() == null) {
            return 0;
        }
        return product.getProductMils().stream()
                .filter(ProductMil::isActive)
                .mapToInt(ProductMil::getStockQuantity)
                .sum();
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
