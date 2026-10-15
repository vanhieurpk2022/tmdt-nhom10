package com.nhom10.tmdt.service.imp;

import com.nhom10.tmdt.dto.order.CreateOrderRequest;
import com.nhom10.tmdt.dto.order.OrderItemResponse;
import com.nhom10.tmdt.dto.order.OrderResponse;
import com.nhom10.tmdt.enums.OrderStatus;
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
import com.nhom10.tmdt.service.shipping.ShippingFeeService;
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

    private final CartItemRepository cartItemRepository;
    private final AddressRepository addressRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ShippingFeeService shippingFeeService;
    private final PurchaseItemService purchaseItems;

    @Transactional
    public OrderResponse createOrderFromCart(String email, CreateOrderRequest request) {
        Address address = addressRepository.findByIdAndUserEmail(request.addressId(), email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy địa chỉ giao hàng"));

        if (request.buyNow() != null && request.cartItemIds() != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Chỉ chọn một hình thức đặt hàng");
        }
        List<CartItem> selectedCartItems = request.buyNow() != null
                ? List.of(purchaseItems.resolve(request.buyNow()))
                : purchaseItems.selectCartItems(email, request.cartItemIds());

        double subtotal = selectedCartItems.stream()
                .mapToDouble(item -> purchaseItems.basePrice(item) * item.getQuantity())
                .sum();
        double discountedSubtotal = selectedCartItems.stream()
                .mapToDouble(item -> purchaseItems.price(item) * item.getQuantity()).sum();
        double discountAmount = Math.max(subtotal - discountedSubtotal, 0);
        double shippingFee = shippingFeeService.calculateFee(address, selectedCartItems, discountedSubtotal);
        double total = Math.max(subtotal - discountAmount, 0) + shippingFee;

        Order order = Order.builder()
                .user(address.getUser())
                .status(OrderStatus.PENDING)
                .subtotalPrice(subtotal)
                .discountAmount(discountAmount)
                .shippingFee(shippingFee)
                .totalPrice(total)
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

        return toResponse(savedOrder, savedItems);
    }

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
