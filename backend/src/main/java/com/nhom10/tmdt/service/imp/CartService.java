package com.nhom10.tmdt.service.imp;

import com.nhom10.tmdt.dto.cart.AddCartItemRequest;
import com.nhom10.tmdt.dto.cart.CartItemResponse;
import com.nhom10.tmdt.dto.cart.CartResponse;
import com.nhom10.tmdt.dto.cart.UpdateCartItemRequest;
import com.nhom10.tmdt.dto.order.BuyNowRequest;
import com.nhom10.tmdt.model.Cart;
import com.nhom10.tmdt.model.CartItem;
import com.nhom10.tmdt.model.User;
import com.nhom10.tmdt.repo.CartItemRepository;
import com.nhom10.tmdt.repo.CartRepository;
import com.nhom10.tmdt.repo.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class CartService {

    private static final int DEFAULT_QUANTITY = 1;

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final PurchaseItemService purchaseItems;

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

        return toResponse(getOrCreateCart(email));
    }

    @Transactional
    public CartResponse updateItem(String email, Long itemId, UpdateCartItemRequest request) {
        CartItem item = getUserCartItem(email, itemId);
        int quantity = request.quantity() == null ? DEFAULT_QUANTITY : request.quantity();
        item.setQuantity(quantity);
        purchaseItems.validate(item);
        cartItemRepository.save(item);

        return toResponse(getOrCreateCart(email));
    }

    @Transactional
    public CartResponse removeItem(String email, Long itemId) {
        CartItem item = getUserCartItem(email, itemId);
        cartItemRepository.delete(item);
        return toResponse(getOrCreateCart(email));
    }

    @Transactional
    public CartResponse clearCart(String email) {
        Cart cart = getOrCreateCart(email);
        cartItemRepository.deleteAllByCartUserEmail(email);
        return new CartResponse(cart.getId(), List.of(), 0, 0.0, 0.0);
    }

    private Cart getOrCreateCart(String email) {
        return cartRepository.findByUserEmail(email)
                .orElseGet(() -> {
                    User user = userRepository.findByEmail(email)
                            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Không tìm thấy người dùng"));

                    Cart cart = Cart.builder()
                            .user(user)
                            .cartItem(new ArrayList<>())
                            .build();
                    return cartRepository.save(cart);
                });
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
