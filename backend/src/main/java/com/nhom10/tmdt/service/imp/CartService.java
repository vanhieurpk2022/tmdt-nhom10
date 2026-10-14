package com.nhom10.tmdt.service.imp;

import com.nhom10.tmdt.dto.cart.AddCartItemRequest;
import com.nhom10.tmdt.dto.cart.CartItemResponse;
import com.nhom10.tmdt.dto.cart.CartResponse;
import com.nhom10.tmdt.dto.cart.UpdateCartItemRequest;
import com.nhom10.tmdt.model.Cart;
import com.nhom10.tmdt.model.CartItem;
import com.nhom10.tmdt.model.Product;
import com.nhom10.tmdt.model.ProductMil;
import com.nhom10.tmdt.model.User;
import com.nhom10.tmdt.repo.CartItemRepository;
import com.nhom10.tmdt.repo.CartRepository;
import com.nhom10.tmdt.repo.ProductRepository;
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
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Transactional
    public CartResponse getCart(String email) {
        Cart cart = getOrCreateCart(email);
        return toResponse(cart);
    }

    @Transactional
    public CartResponse addItem(String email, AddCartItemRequest request) {
        Cart cart = getOrCreateCart(email);
        Product product = productRepository.findById(request.productId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy sản phẩm"));

        int quantity = normalizeQuantity(request.quantity());
        int stockQuantity = getStockQuantity(product);
        validateStock(stockQuantity, quantity);

        CartItem item = cartItemRepository.findByCartIdAndProductId(cart.getId(), product.getId())
                .orElseGet(() -> CartItem.builder()
                        .cart(cart)
                        .product(product)
                        .quantity(0)
                        .build());

        int nextQuantity = item.getQuantity() + quantity;
        validateStock(stockQuantity, nextQuantity);

        item.setQuantity(nextQuantity);
        cartItemRepository.save(item);

        return toResponse(getOrCreateCart(email));
    }

    @Transactional
    public CartResponse updateItem(String email, Long itemId, UpdateCartItemRequest request) {
        CartItem item = getUserCartItem(email, itemId);
        int quantity = normalizeQuantity(request.quantity());
        validateStock(getStockQuantity(item.getProduct()), quantity);

        item.setQuantity(quantity);
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
        return new CartResponse(cart.getId(), List.of(), 0, 0.0, 0.0, 0.0);
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
                .map(this::toItemResponse)
                .toList();

        int totalItems = items.stream()
                .mapToInt(CartItemResponse::quantity)
                .sum();
        double subtotal = items.stream()
                .mapToDouble(item -> valueOrZero(item.basePrice()) * item.quantity())
                .sum();
        double total = items.stream()
                .mapToDouble(CartItemResponse::lineTotal)
                .sum();

        return new CartResponse(
                cart.getId(),
                items,
                totalItems,
                subtotal,
                Math.max(subtotal - total, 0),
                total
        );
    }

    private CartItemResponse toItemResponse(CartItem item) {
        Product product = item.getProduct();
        Double price = resolvePrice(product);
        Double basePrice = resolveBasePrice(product, price);
        int stockQuantity = getStockQuantity(product);

        return new CartItemResponse(
                item.getId(),
                product.getId(),
                product.getName(),
                product.getDescription(),
                product.getFactory() != null ? product.getFactory().getName() : null,
                getThumbnailUrl(product),
                price,
                basePrice,
                item.getQuantity(),
                stockQuantity,
                getStockStatus(stockQuantity),
                valueOrZero(price) * item.getQuantity()
        );
    }

    private int normalizeQuantity(Integer quantity) {
        return quantity == null ? DEFAULT_QUANTITY : quantity;
    }

    private void validateStock(int stockQuantity, int quantity) {
        if (stockQuantity <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Sản phẩm đã hết hàng");
        }
        if (quantity > stockQuantity) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Số lượng vượt quá tồn kho");
        }
    }

    private Double resolvePrice(Product product) {
        if (product.getPrice() != null && product.getPrice() > 0) {
            return product.getPrice();
        }
        return minProductMilPrice(product, true);
    }

    private Double resolveBasePrice(Product product, Double fallbackPrice) {
        if (product.getMinBasePrice() != null && product.getMinBasePrice() > 0) {
            return product.getMinBasePrice();
        }
        Double basePrice = minProductMilPrice(product, false);
        return basePrice == null ? fallbackPrice : basePrice;
    }

    private Double minProductMilPrice(Product product, boolean salePrice) {
        if (product.getProductMils() == null || product.getProductMils().isEmpty()) {
            return null;
        }
        return product.getProductMils().stream()
                .filter(ProductMil::isActive)
                .map(salePrice ? ProductMil::getPrice : ProductMil::getBasePrice)
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

    private String getStockStatus(int stockQuantity) {
        if (stockQuantity <= 0) {
            return "Hết hàng";
        }
        return stockQuantity <= 10 ? "Sắp hết" : "Còn hàng";
    }

    private String getThumbnailUrl(Product product) {
        if (product.getProductImages() == null || product.getProductImages().isEmpty()) {
            return null;
        }
        return product.getProductImages().getFirst().getImageUrl();
    }

    private double valueOrZero(Double value) {
        return value == null ? 0 : value;
    }
}
