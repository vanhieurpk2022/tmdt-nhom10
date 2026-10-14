package com.nhom10.tmdt.rest;

import com.nhom10.tmdt.dto.ApiResponse;
import com.nhom10.tmdt.dto.shipping.ShippingFeeRequest;
import com.nhom10.tmdt.dto.shipping.ShippingFeeResponse;
import com.nhom10.tmdt.service.shipping.ShippingFeeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/shipping")
public class ShippingController {

    private final ShippingFeeService shippingFeeService;

    @PostMapping("/fee")
    public ApiResponse<ShippingFeeResponse> calculateFee(
            Authentication authentication,
            @Valid @RequestBody ShippingFeeRequest request
    ) {
        return new ApiResponse<>(
                200,
                "Tính phí vận chuyển thành công",
                shippingFeeService.quoteForCart(authentication.getName(), request)
        );
    }
}
