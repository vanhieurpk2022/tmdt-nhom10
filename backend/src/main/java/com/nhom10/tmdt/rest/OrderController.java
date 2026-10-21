package com.nhom10.tmdt.rest;

import com.nhom10.tmdt.dto.ApiResponse;
import com.nhom10.tmdt.dto.order.CreateOrderRequest;
import com.nhom10.tmdt.dto.order.OrderResponse;
import com.nhom10.tmdt.dto.order.OrderHistoryResponse;
import com.nhom10.tmdt.service.order.OrderHistoryService;
import com.nhom10.tmdt.dto.order.BuyNowRequest;
import com.nhom10.tmdt.dto.cart.CartItemResponse;
import com.nhom10.tmdt.service.imp.PurchaseItemService;
import com.nhom10.tmdt.service.imp.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.http.ResponseEntity;
import org.springframework.http.CacheControl;
import com.nhom10.tmdt.service.payment.VnPayQueryService;
import com.nhom10.tmdt.dto.order.PaymentStatusResponse;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/orders")
public class OrderController {

    private final OrderService orderService;
    private final PurchaseItemService purchaseItems;
    private final VnPayQueryService queries;
    private final OrderHistoryService history;

    @GetMapping
    public ResponseEntity<ApiResponse<OrderHistoryResponse>> list(Authentication auth,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "all") String status,
            @RequestParam(defaultValue = "") String search) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore())
                .body(new ApiResponse<>(200, "Danh sách đơn hàng", history.list(auth.getName(), page, status, search)));
    }

    @GetMapping("/checkout-status")
    public ResponseEntity<ApiResponse<OrderResponse>> recover(Authentication auth, @RequestParam String key) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore())
                .body(new ApiResponse<>(200, "Yêu cầu đặt hàng trước", orderService.recoverCheckout(auth.getName(), key)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderResponse>> get(Authentication auth, @PathVariable Long id) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore())
                .body(new ApiResponse<>(200, "Thông tin đơn hàng", orderService.getOrder(auth.getName(), id)));
    }

    @GetMapping("/{id}/payment-status")
    public ResponseEntity<ApiResponse<PaymentStatusResponse>> status(Authentication auth, @PathVariable Long id) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore())
                .body(new ApiResponse<>(200, "Trạng thái thanh toán", queries.status(auth.getName(), id, null)));
    }

    @PostMapping("/buy-now/preview")
    public ApiResponse<CartItemResponse> preview(@Valid @RequestBody BuyNowRequest request) {
        return new ApiResponse<>(200, "Lấy sản phẩm mua ngay thành công", purchaseItems.preview(request));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<OrderResponse> createOrder(
            Authentication authentication,
            @Valid @RequestBody CreateOrderRequest request,
            @RequestHeader("Idempotency-Key") String key
    ) {
        return new ApiResponse<>(
                HttpStatus.CREATED.value(),
                "Đặt hàng thành công",
                orderService.createOrderFromCart(authentication.getName(), request, key)
        );
    }
}
