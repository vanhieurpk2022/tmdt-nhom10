package com.nhom10.tmdt.rest;

import com.nhom10.tmdt.dto.ApiResponse;
import com.nhom10.tmdt.dto.cart.AddCartItemRequest;
import com.nhom10.tmdt.dto.cart.CartResponse;
import com.nhom10.tmdt.dto.cart.UpdateCartItemRequest;
import com.nhom10.tmdt.service.imp.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/cart")
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ApiResponse<CartResponse> getCart(Authentication authentication) {
        return new ApiResponse<>(200, "Lấy giỏ hàng thành công", cartService.getCart(authentication.getName()));
    }

    @PostMapping("/items")
    public ApiResponse<CartResponse> addItem(
            Authentication authentication,
            @Valid @RequestBody AddCartItemRequest request
    ) {
        return new ApiResponse<>(200, "Thêm sản phẩm vào giỏ hàng thành công", cartService.addItem(authentication.getName(), request));
    }

    @PutMapping("/items/{itemId}")
    public ApiResponse<CartResponse> updateItem(
            Authentication authentication,
            @PathVariable Long itemId,
            @Valid @RequestBody UpdateCartItemRequest request
    ) {
        return new ApiResponse<>(200, "Cập nhật giỏ hàng thành công", cartService.updateItem(authentication.getName(), itemId, request));
    }

    @DeleteMapping("/items/{itemId}")
    public ApiResponse<CartResponse> removeItem(
            Authentication authentication,
            @PathVariable Long itemId
    ) {
        return new ApiResponse<>(200, "Xóa sản phẩm khỏi giỏ hàng thành công", cartService.removeItem(authentication.getName(), itemId));
    }

    @DeleteMapping("/items")
    public ApiResponse<CartResponse> clearCart(Authentication authentication) {
        return new ApiResponse<>(200, "Xóa toàn bộ giỏ hàng thành công", cartService.clearCart(authentication.getName()));
    }
}
