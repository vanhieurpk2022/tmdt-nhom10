package com.nhom10.tmdt.rest;

import com.nhom10.tmdt.dto.ApiResponse;
import com.nhom10.tmdt.dto.customscent.ScentProductItem;
import com.nhom10.tmdt.model.Factory;
import com.nhom10.tmdt.model.Product;
import com.nhom10.tmdt.repo.FactoryRepository;
import com.nhom10.tmdt.repo.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/custom-scent")
@RequiredArgsConstructor
public class CustomScentController {

    private final ProductRepository productRepo;
    private final FactoryRepository factoryRepo;

    /**
     * Lấy danh sách mùi hương tinh dầu có sẵn của một xưởng cụ thể
     * kèm thông tin giá và phân tầng tự nhiên
     */
    @GetMapping("/factories/{factoryId}/scents")
    public ResponseEntity<ApiResponse<List<ScentProductItem>>> getScentsByFactory(@PathVariable Long factoryId) {
        Factory factory = factoryRepo.findById(factoryId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy xưởng: " + factoryId));

        List<Product> products = productRepo.findByFactoryId(factoryId);

        List<ScentProductItem> scents = products.stream().map(p -> {
            // Tự động phân tầng hương (Tier 1: Top, Tier 2: Heart, Tier 3: Base)
            int tier = determineTier(p.getName());
            String color = determineColor(p.getName());

            return new ScentProductItem(
                    p.getId(),
                    p.getName(),
                    p.getDescription() != null && !p.getDescription().isBlank() ? p.getDescription() : "Tinh dầu thiên nhiên nguyên chất từ xưởng",
                    p.getPrice() != null ? p.getPrice() : 150000.0,
                    factory.getId(),
                    factory.getName(),
                    tier,
                    color
            );
        }).toList();

        return ResponseEntity.ok(ApiResponse.<List<ScentProductItem>>builder()
                .success(true)
                .data(scents)
                .message("Lấy danh sách mùi hương theo xưởng thành công")
                .build());
    }

    private int determineTier(String name) {
        if (name == null) return 2;
        String lower = name.toLowerCase();
        if (lower.contains("cam") || lower.contains("chanh") || lower.contains("bưởi") || lower.contains("bạc hà") || lower.contains("quýt") || lower.contains("trà")) {
            return 1; // Nốt đầu (Top Notes)
        }
        if (lower.contains("trầm") || lower.contains("đàn hương") || lower.contains("hoàng đàn") || lower.contains("gỗ") || lower.contains("vani") || lower.contains("hổ phách")) {
            return 3; // Nốt đáy (Base Notes)
        }
        return 2; // Nốt giữa (Heart Notes: Hoa hồng, hoa nhài, sả chanh, oải hương, v.v.)
    }

    private String determineColor(String name) {
        if (name == null) return "#fef08a";
        String lower = name.toLowerCase();
        if (lower.contains("bạc hà") || lower.contains("trà")) return "#a7f3d0";
        if (lower.contains("cam") || lower.contains("quýt")) return "#fed7aa";
        if (lower.contains("chanh") || lower.contains("bưởi")) return "#fef9c3";
        if (lower.contains("hồng") || lower.contains("ngọc lan")) return "#fbcfe8";
        if (lower.contains("oải hương")) return "#ddd6fe";
        if (lower.contains("gỗ") || lower.contains("trầm")) return "#fde68a";
        return "#fed7aa";
    }
}
