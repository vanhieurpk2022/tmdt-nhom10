package com.nhom10.tmdt.rest;

import com.nhom10.tmdt.dto.ApiResponse;
import com.nhom10.tmdt.dto.product.ProductMilResponse;
import com.nhom10.tmdt.model.Product;
import com.nhom10.tmdt.model.ProductImage;
import com.nhom10.tmdt.repo.ProductRepository;
import com.nhom10.tmdt.service.imp.PurchaseItemService;
import com.nhom10.tmdt.service.imp.RecommendationEligibility;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Comparator;
import java.util.List;

/** Chỉ xuất catalog công khai; không xuất entity hay thông tin khách hàng. */
@RestController
@RequiredArgsConstructor
public class ChatbotCatalogController {
    private final ProductRepository products;
    private final PurchaseItemService purchases;

    public record CatalogItem(Long id, String name, String description, String category,
                              Long factoryId, String factoryName, String imageUrl,
                              String link, List<ProductMilResponse> variants) {}

    @GetMapping("/products/chatbot-catalog")
    @Transactional(readOnly = true)
    public ApiResponse<List<CatalogItem>> catalog() {
        List<CatalogItem> items = products.findAll().stream()
                .filter(RecommendationEligibility::isAvailable)
                .sorted(Comparator.comparing(Product::getId))
                .map(p -> new CatalogItem(p.getId(), p.getName(), p.getDescription(),
                        p.getCategory() == null ? "" : p.getCategory().getName(),
                        p.getFactory() == null ? null : p.getFactory().getId(),
                        p.getFactory() == null ? "" : p.getFactory().getName(),
                        p.getProductImages() == null ? null : p.getProductImages().stream()
                                .sorted(Comparator.comparing(ProductImage::isThumbnail).reversed())
                                .map(ProductImage::getImageUrl).filter(u -> u != null && !u.isBlank())
                                .findFirst().orElse(null),
                        "/product-detail/" + p.getId(),
                        p.getProductMils().stream().filter(RecommendationEligibility::isAvailableVariant)
                                .map(v -> new ProductMilResponse(v.getId(), v.getMil(), purchases.price(v),
                                        v.getStockQuantity(), true)).toList()))
                .toList();
        return new ApiResponse<>(200, "Catalog hiện tại", items);
    }
}
