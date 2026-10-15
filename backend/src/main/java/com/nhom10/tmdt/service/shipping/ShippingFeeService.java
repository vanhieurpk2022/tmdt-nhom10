package com.nhom10.tmdt.service.shipping;

import com.nhom10.tmdt.config.GhnShippingProperties;
import com.nhom10.tmdt.dto.shipping.GhnFeeResponse;
import com.nhom10.tmdt.dto.shipping.GhnResolvedAddress;
import com.nhom10.tmdt.dto.shipping.ShippingFeeRequest;
import com.nhom10.tmdt.dto.shipping.ShippingFeeResponse;
import com.nhom10.tmdt.model.Address;
import com.nhom10.tmdt.model.CartItem;
import com.nhom10.tmdt.repo.AddressRepository;
import com.nhom10.tmdt.service.imp.PurchaseItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ShippingFeeService {

    private final AddressRepository addressRepository;
    private final GhnShippingProperties ghnShippingProperties;
    private final GhnShippingClient ghnShippingClient;
    private final GhnLocationResolver ghnLocationResolver;
    private final PurchaseItemService purchaseItems;

    @Transactional(readOnly = true)
    public ShippingFeeResponse quoteForCart(String email, ShippingFeeRequest request) {
        Address address = addressRepository.findByIdAndUserEmail(request.addressId(), email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy địa chỉ giao hàng"));
        if (request.buyNow() != null && request.cartItemIds() != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Chỉ chọn một hình thức đặt hàng");
        }
        List<CartItem> selectedItems = request.buyNow() != null
                ? List.of(purchaseItems.resolve(request.buyNow()))
                : purchaseItems.selectCartItems(email, request.cartItemIds());
        double subtotal = selectedItems.stream()
                .mapToDouble(item -> purchaseItems.price(item) * item.getQuantity())
                .sum();

        int shippingFee = calculateFee(address, selectedItems, subtotal);

        return new ShippingFeeResponse(
                address.getId(),
                shippingFee,
                "GHN",
                "Tính phí vận chuyển thành công"
        );
    }

    public int calculateFee(Address address, List<CartItem> selectedItems, double insuranceValue) {
        if (selectedItems == null || selectedItems.isEmpty()) {
            return 0;
        }

        GhnResolvedAddress resolvedAddress = ghnLocationResolver.resolve(address);
        int packageWeight = calculatePackageWeight(selectedItems);
        GhnFeeResponse feeResponse = ghnShippingClient.calculateFee(
                ghnShippingClient.buildDefaultFeeRequest(
                        resolvedAddress.districtId(),
                        resolvedAddress.wardCode(),
                        toPositiveInt(insuranceValue),
                        packageWeight
                )
        );

        int shippingFee = feeResponse.totalOrZero();
        if (shippingFee <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "GHN chưa trả về phí vận chuyển hợp lệ");
        }
        return shippingFee;
    }

    private int calculatePackageWeight(List<CartItem> selectedItems) {
        int totalQuantity = selectedItems.stream()
                .mapToInt(CartItem::getQuantity)
                .sum();
        return Math.max(totalQuantity, 1) * ghnShippingProperties.getDefaultWeight();
    }

    private int toPositiveInt(double value) {
        return (int) Math.min(Math.max(Math.round(value), 0), Integer.MAX_VALUE);
    }

}
