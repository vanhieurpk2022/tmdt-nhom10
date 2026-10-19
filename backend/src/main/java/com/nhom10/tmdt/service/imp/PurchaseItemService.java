package com.nhom10.tmdt.service.imp;

import com.nhom10.tmdt.dto.cart.CartItemResponse;
import com.nhom10.tmdt.dto.order.BuyNowRequest;
import com.nhom10.tmdt.model.*;
import com.nhom10.tmdt.repo.CartItemRepository;
import com.nhom10.tmdt.repo.CartRepository;
import com.nhom10.tmdt.repo.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class PurchaseItemService {
    private final ProductRepository productRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;

    @Transactional(readOnly = true)
    public CartItemResponse preview(BuyNowRequest request) {
        return toResponse(resolve(request));
    }

    public CartItem resolve(BuyNowRequest request) {
        Product product = productRepository.findById(request.productId())
                .orElseThrow(() -> error("Không tìm thấy sản phẩm"));
        ProductMil variant = request.productMilId() == null ? defaultVariant(product)
                : variants(product).stream()
                        .filter(v -> Objects.equals(v.getId(), request.productMilId()))
                        .findFirst().orElseThrow(() -> error("Dung tích không thuộc sản phẩm đã chọn"));
        CartItem item = CartItem.builder().product(product).productMil(variant)
                .quantity(request.quantity() == null ? 1 : request.quantity()).build();
        validate(item);
        return item;
    }

    public List<CartItem> selectCartItems(String email, List<Long> ids) {
        Cart cart = cartRepository.findByUserEmail(email)
                .orElseThrow(() -> error("Giỏ hàng đang trống"));
        List<CartItem> items = cartItemRepository.findByCartIdOrderByIdAsc(cart.getId());
        if (ids != null) {
            var selectedIds = new HashSet<>(ids);
            items = items.stream().filter(item -> selectedIds.contains(item.getId())).toList();
            if (items.size() != selectedIds.size()) {
                throw error("Một số sản phẩm đã chọn không còn trong giỏ hàng. Vui lòng chọn lại.");
            }
        }
        if (items.isEmpty()) throw error("Vui lòng chọn sản phẩm để đặt hàng");
        items.forEach(this::validate);
        return items;
    }

    public ProductMil variant(CartItem item) {
        return item.getProductMil() != null ? item.getProductMil() : defaultVariant(item.getProduct());
    }

    private ProductMil defaultVariant(Product product) {
        return variants(product).stream().filter(ProductMil::isActive)
                .filter(v -> price(v) > 0)
                .min(Comparator.comparingDouble((ProductMil v) -> price(v)).thenComparingInt(ProductMil::getMil))
                .orElseThrow(() -> error("Sản phẩm chưa có dung tích đang bán"));
    }

    private List<ProductMil> variants(Product product) {
        return product.getProductMils() == null ? List.of() : product.getProductMils();
    }

    public double price(ProductMil variant) {
        Double price = variant.getBasePrice() != null ? variant.getBasePrice() : variant.getPrice();
        return price != null && Double.isFinite(price) ? price : 0;
    }

    public double price(CartItem item) {
        return price(variant(item));
    }

    public int stock(CartItem item) {
        ProductMil variant = variant(item);
        return variant.isActive() ? variant.getStockQuantity() : 0;
    }

    public void validate(CartItem item) {
        ProductMil variant = variant(item);
        if (!Objects.equals(variant.getProduct().getId(), item.getProduct().getId())) {
            throw error("Dung tích không thuộc sản phẩm đã chọn");
        }
        if (item.getQuantity() < 1) throw error("Số lượng phải lớn hơn 0");
        if (price(item) <= 0) throw error("Sản phẩm chưa có giá hợp lệ");
        if (stock(item) <= 0) throw error("Dung tích đã chọn hiện đã hết hàng");
        if (item.getQuantity() > stock(item)) throw error("Số lượng vượt quá tồn kho của dung tích đã chọn");
    }

    public CartItemResponse toResponse(CartItem item) {
        Product product = item.getProduct();
        ProductMil variant = variant(item);
        int stock = stock(item);
        String image = product.getProductImages() == null ? null : product.getProductImages().stream()
                .map(ProductImage::getImageUrl).filter(Objects::nonNull).findFirst().orElse(null);
        return new CartItemResponse(item.getId() == null ? product.getId() : item.getId(),
                product.getId(), product.getName(), product.getDescription(),
                product.getFactory() == null ? null : product.getFactory().getName(), image,
                price(item), item.getQuantity(), stock,
                stock <= 0 ? "Hết hàng" : stock <= 10 ? "Sắp hết" : "Còn hàng",
                price(item) * item.getQuantity(), variant.getId(), variant.getMil());
    }

    private ResponseStatusException error(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }
}
