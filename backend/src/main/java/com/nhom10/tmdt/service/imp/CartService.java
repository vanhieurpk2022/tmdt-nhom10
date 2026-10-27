package com.nhom10.tmdt.service.imp;

import com.nhom10.tmdt.dto.cart.AddCartItemRequest;
import com.nhom10.tmdt.dto.cart.CartItemResponse;
import com.nhom10.tmdt.dto.cart.CartResponse;
import com.nhom10.tmdt.dto.cart.UpdateCartItemRequest;
import com.nhom10.tmdt.dto.order.BuyNowRequest;
import com.nhom10.tmdt.enums.ProductStatus;
import com.nhom10.tmdt.enums.ProductType;
import com.nhom10.tmdt.model.Cart;
import com.nhom10.tmdt.model.CartItem;
import com.nhom10.tmdt.model.OrderItem;
import com.nhom10.tmdt.model.Product;
import com.nhom10.tmdt.model.ProductMil;
import com.nhom10.tmdt.model.User;
import com.nhom10.tmdt.repo.CartItemRepository;
import com.nhom10.tmdt.repo.CartRepository;
import com.nhom10.tmdt.repo.OrderRepository;
import com.nhom10.tmdt.repo.ProductMilRepository;
import com.nhom10.tmdt.repo.UserRepository;
import com.nhom10.tmdt.service.payment.VndMoney;
import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Map;
import java.util.TreeMap;

@Service
@RequiredArgsConstructor
public class CartService {

    private static final int DEFAULT_QUANTITY = 1;

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final PurchaseItemService purchaseItems;
    private final OrderRepository orderRepository;
    private final ProductMilRepository productMilRepository;
    private final EntityManager entityManager;

    @Transactional
    public CartResponse getCart(String email) {
        Cart cart = getOrCreateCart(email);
        return toResponse(cart);
    }

    @Transactional
    public CartResponse addItem(String email, AddCartItemRequest request) {
        Cart cart = getOrCreateCart(email);
        int quantity = request.quantity() == null ? DEFAULT_QUANTITY : request.quantity();
        CartItem selection = purchaseItems.resolve(new BuyNowRequest(request.productId(), request.productMilId(), quantity));
        CartItem item = cartItemRepository.findByCartIdOrderByIdAsc(cart.getId()).stream()
                .filter(existing -> Objects.equals(existing.getProduct().getId(), selection.getProduct().getId()))
                .filter(existing -> Objects.equals(purchaseItems.variant(existing).getId(), selection.getProductMil().getId()))
                .findFirst().orElseGet(() -> CartItem.builder().cart(cart)
                        .product(selection.getProduct()).quantity(0).build());
        item.setProductMil(selection.getProductMil());
        int nextQuantity = item.getQuantity() + quantity;
        item.setQuantity(nextQuantity);
        purchaseItems.validate(item);
        cartItemRepository.save(item);

        return toResponse(cart);
    }

    @Transactional
    public CartResponse updateItem(String email, Long itemId, UpdateCartItemRequest request) {
        Cart cart = getOrCreateCart(email);
        CartItem item = getUserCartItem(email, itemId);
        int quantity = request.quantity() == null ? DEFAULT_QUANTITY : request.quantity();
        item.setQuantity(quantity);
        purchaseItems.validate(item);
        cartItemRepository.save(item);

        return toResponse(cart);
    }

    @Transactional
    public CartResponse removeItem(String email, Long itemId) {
        Cart cart = getOrCreateCart(email);
        CartItem item = getUserCartItem(email, itemId);
        cartItemRepository.delete(item);
        return toResponse(cart);
    }

    @Transactional
    public CartResponse clearCart(String email) {
        Cart cart = getOrCreateCart(email);
        cartItemRepository.deleteAllByCartUserEmail(email);
        return new CartResponse(cart.getId(), List.of(), 0, 0.0, 0.0);
    }

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public CartResponse reorder(String email, Long orderId) {
        Cart cart = getOrCreateCart(email);
        var order = orderRepository.findByIdAndUserEmail(orderId, email).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy đơn hàng"));
        if (order.getOrderItems() == null || order.getOrderItems().isEmpty()) {
            throw conflict("Đơn hàng không có sản phẩm để đặt lại");
        }
        Map<Long, List<OrderItem>> selections = new TreeMap<>();
        for (OrderItem item : order.getOrderItems()) {
            if (item.getProduct() == null || item.getProductMil() == null || item.getQuantity() <= 0) {
                throw conflict("Đơn cũ thiếu thông tin sản phẩm hoặc dung tích, vui lòng chọn lại sản phẩm");
            }
            selections.computeIfAbsent(item.getProductMil().getId(), id -> new ArrayList<>()).add(item);
        }

        List<CartItem> cartItems = cartItemRepository.findByCartIdOrderByIdAsc(cart.getId());
        try {
            for (var selection : selections.entrySet()) {
                ProductMil variant = productMilRepository.lockById(selection.getKey()).orElseThrow(() ->
                        conflict("Dung tích sản phẩm trong đơn cũ không còn tồn tại"));
                entityManager.refresh(variant, LockModeType.PESSIMISTIC_WRITE);
                Product product = variant.getProduct();
                if (product == null || selection.getValue().stream().anyMatch(item ->
                        !Objects.equals(item.getProduct().getId(), product.getId()))) {
                    throw conflict("Dung tích không còn thuộc sản phẩm trong đơn cũ");
                }
                entityManager.refresh(product);
                if (product.getStatus() != ProductStatus.ACTIVE) {
                    throw conflict("Sản phẩm không còn mở bán: " + product.getName());
                }
                if (product.getProductType() == ProductType.CUSTOM) {
                    throw conflict("Vui lòng phối hương lại để cập nhật cấu hình và giá sản phẩm tùy chỉnh");
                }
                List<CartItem> matching = cartItems.stream()
                        .filter(item -> item.getProduct() != null && Objects.equals(item.getProduct().getId(), product.getId()))
                        .filter(item -> Objects.equals(purchaseItems.variant(item).getId(), variant.getId())).toList();
                if (matching.stream().anyMatch(item -> item.getQuantity() <= 0)) {
                    throw conflict("Số lượng sản phẩm trong giỏ cần được kiểm tra lại");
                }
                int orderedQuantity = selection.getValue().stream().mapToInt(OrderItem::getQuantity).reduce(0, Math::addExact);
                int currentQuantity = matching.stream().mapToInt(CartItem::getQuantity).reduce(0, Math::addExact);
                CartItem item = matching.isEmpty() ? CartItem.builder().cart(cart).product(product).build() : matching.getFirst();
                item.setProductMil(variant);
                item.setQuantity(Math.max(orderedQuantity, currentQuantity));
                try {
                    purchaseItems.validate(item);
                    VndMoney.exact(purchaseItems.price(item));
                } catch (ResponseStatusException ex) {
                    throw conflict(product.getName() + ": " + ex.getReason());
                }
                cartItemRepository.save(item);
                cartItemRepository.deleteAll(matching.stream().skip(1).toList());
            }
        } catch (ArithmeticException ex) {
            throw conflict("Số lượng sản phẩm vượt giới hạn cho phép");
        }
        return toResponse(cart);
    }

    private Cart getOrCreateCart(String email) {
        User user = userRepository.lockByEmail(email).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Không tìm thấy người dùng"));
        return cartRepository.findByUserEmail(email).orElseGet(() -> cartRepository.save(
                Cart.builder().user(user).cartItem(new ArrayList<>()).build()));
    }

    private static ResponseStatusException conflict(String message) {
        return new ResponseStatusException(HttpStatus.CONFLICT, message);
    }

    private CartItem getUserCartItem(String email, Long itemId) {
        return cartItemRepository.findByIdAndCartUserEmail(itemId, email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy sản phẩm trong giỏ hàng"));
    }

    private CartResponse toResponse(Cart cart) {
        List<CartItemResponse> items = cartItemRepository.findByCartIdOrderByIdAsc(cart.getId()).stream()
                .map(purchaseItems::toResponse)
                .toList();

        int totalItems = items.stream()
                .mapToInt(CartItemResponse::quantity)
                .sum();
        double total = items.stream()
                .mapToDouble(CartItemResponse::lineTotal)
                .sum();

        return new CartResponse(
                cart.getId(),
                items,
                totalItems,
                total,
                total
        );
    }

}
