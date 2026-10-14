package com.nhom10.tmdt.service.shipping;

import com.nhom10.tmdt.config.GhnShippingProperties;
import com.nhom10.tmdt.dto.shipping.GhnFeeResponse;
import com.nhom10.tmdt.dto.shipping.GhnResolvedAddress;
import com.nhom10.tmdt.dto.shipping.ShippingFeeRequest;
import com.nhom10.tmdt.dto.shipping.ShippingFeeResponse;
import com.nhom10.tmdt.model.Address;
import com.nhom10.tmdt.model.Cart;
import com.nhom10.tmdt.model.CartItem;
import com.nhom10.tmdt.model.Product;
import com.nhom10.tmdt.model.ProductMil;
import com.nhom10.tmdt.repo.AddressRepository;
import com.nhom10.tmdt.repo.CartItemRepository;
import com.nhom10.tmdt.repo.CartRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class ShippingFeeService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final AddressRepository addressRepository;
    private final GhnShippingProperties ghnShippingProperties;
    private final GhnShippingClient ghnShippingClient;
    private final GhnLocationResolver ghnLocationResolver;

    @Transactional(readOnly = true)
    public ShippingFeeResponse quoteForCart(String email, ShippingFeeRequest request) {
        Address address = addressRepository.findByIdAndUserEmail(request.addressId(), email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy địa chỉ giao hàng"));
        Cart cart = cartRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Giỏ hàng đang trống"));
        List<CartItem> selectedItems = resolveSelectedCartItems(
                cartItemRepository.findByCartIdOrderByIdAsc(cart.getId()),
                request.cartItemIds()
        );
        double subtotal = selectedItems.stream()
                .mapToDouble(item -> resolvePrice(item.getProduct()) * item.getQuantity())
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

    private List<CartItem> resolveSelectedCartItems(List<CartItem> cartItems, List<Long> cartItemIds) {
        if (cartItems == null || cartItems.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Giỏ hàng đang trống");
        }
        if (cartItemIds == null || cartItemIds.isEmpty()) {
            return cartItems;
        }

        Set<Long> selectedIds = new HashSet<>(cartItemIds);
        List<CartItem> selectedItems = cartItems.stream()
                .filter(item -> selectedIds.contains(item.getId()))
                .toList();

        if (selectedItems.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vui lòng chọn sản phẩm để đặt hàng");
        }
        if (selectedItems.size() != selectedIds.size()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Một số sản phẩm đã chọn không còn trong giỏ hàng");
        }

        return selectedItems;
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

    private double resolvePrice(Product product) {
        if (product.getPrice() != null && product.getPrice() > 0) {
            return product.getPrice();
        }
        return minProductMilPrice(product);
    }

    private double minProductMilPrice(Product product) {
        if (product.getProductMils() == null || product.getProductMils().isEmpty()) {
            return 0;
        }
        return product.getProductMils().stream()
                .filter(ProductMil::isActive)
                .map(ProductMil::getPrice)
                .filter(Objects::nonNull)
                .filter(price -> price > 0)
                .min(Double::compareTo)
                .orElse(0.0);
    }
}
