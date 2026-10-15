package com.nhom10.tmdt.rest;

import com.nhom10.tmdt.dto.ApiResponse;
import com.nhom10.tmdt.dto.order.CreateOrderRequest;
import com.nhom10.tmdt.dto.order.OrderResponse;
import com.nhom10.tmdt.dto.order.BuyNowRequest;
import com.nhom10.tmdt.dto.cart.CartItemResponse;
import com.nhom10.tmdt.service.imp.PurchaseItemService;
import com.nhom10.tmdt.service.imp.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/orders")
public class OrderController {

    private final OrderService orderService;
    private final PurchaseItemService purchaseItems;

    @PostMapping("/buy-now/preview")
    public ApiResponse<CartItemResponse> preview(@Valid @RequestBody BuyNowRequest request) {
        return new ApiResponse<>(200, "Lấy sản phẩm mua ngay thành công", purchaseItems.preview(request));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<OrderResponse> createOrder(
            Authentication authentication,
            @Valid @RequestBody CreateOrderRequest request
    ) {
        return new ApiResponse<>(
                HttpStatus.CREATED.value(),
                "Đặt hàng thành công",
                orderService.createOrderFromCart(authentication.getName(), request)
        );
    }
}
