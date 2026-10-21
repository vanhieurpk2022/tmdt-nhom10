package com.nhom10.tmdt.rest;

import com.nhom10.tmdt.dto.ApiResponse;
import com.nhom10.tmdt.dto.shipping.GhnDistrictResponse;
import com.nhom10.tmdt.dto.shipping.GhnProvinceResponse;
import com.nhom10.tmdt.dto.shipping.GhnWardResponse;
import com.nhom10.tmdt.dto.shipping.ShippingFeeRequest;
import com.nhom10.tmdt.dto.shipping.ShippingFeeResponse;
import com.nhom10.tmdt.service.shipping.GhnShippingClient;
import com.nhom10.tmdt.service.shipping.ShippingFeeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/shipping")
public class ShippingController {

    private final ShippingFeeService shippingFeeService;
    private final GhnShippingClient ghnShippingClient;

    @GetMapping("/provinces")
    public ApiResponse<List<GhnProvinceResponse>> getProvinces() {
        return new ApiResponse<>(
                200,
                "Lấy danh sách tỉnh/thành phố thành công",
                ghnShippingClient.getProvinces()
        );
    }

    @GetMapping("/districts")
    public ApiResponse<List<GhnDistrictResponse>> getDistricts(@RequestParam("provinceId") int provinceId) {
        return new ApiResponse<>(
                200,
                "Lấy danh sách quận/huyện thành công",
                ghnShippingClient.getDistricts(provinceId)
        );
    }

    @GetMapping("/wards")
    public ApiResponse<List<GhnWardResponse>> getWards(@RequestParam("districtId") int districtId) {
        return new ApiResponse<>(
                200,
                "Lấy danh sách phường/xã thành công",
                ghnShippingClient.getWards(districtId)
        );
    }

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
