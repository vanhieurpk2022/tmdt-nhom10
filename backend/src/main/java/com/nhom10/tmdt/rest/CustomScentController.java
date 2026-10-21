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
@RequestMapping("/custom-scent")
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

                List<ScentProductItem> scents = products.stream()
                                .map(p -> new ScentProductItem(
                                                p.getId(),
                                                p.getName(),
                                                p.getDescription(),
                                                p.getPrice() != null ? p.getPrice() : 150000.0,
                                                factory.getId(),
                                                factory.getName(),
                                                null))
                                .toList();

                return ResponseEntity
                                .ok(new ApiResponse<>(200, "Lấy danh sách mùi hương theo xưởng thành công", scents));
        }
}
