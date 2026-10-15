package com.nhom10.tmdt.service.imp;

import com.nhom10.tmdt.dto.factory.FactoryItemResponse;
import com.nhom10.tmdt.model.Factory;
import com.nhom10.tmdt.model.FactoryImage;
import com.nhom10.tmdt.repo.FactoryRepository;
import com.nhom10.tmdt.repo.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FactoryService {

    private final FactoryRepository factoryRepo;
    private final ProductRepository productRepo;

    public List<FactoryItemResponse> getAllFactories() {
        // Đếm số lượng sản phẩm theo từng factory
        Map<Long, Long> facCount = productRepo.countByFactory().stream()
                .collect(Collectors.toMap(r -> (Long) r[0], r -> (Long) r[1]));

        List<Factory> factories = factoryRepo.findAll();

        return factories.stream().map(f -> {
            String avatarUrl = null;
            String bannerUrl = null;
            List<String> gallery = new ArrayList<>();

            if (f.getFactoryImages() != null) {
                for (FactoryImage img : f.getFactoryImages()) {
                    if (img.getImageUrl() == null || img.getImageUrl().isBlank()) continue;
                    if (img.isAvatar() && avatarUrl == null) {
                        avatarUrl = img.getImageUrl();
                    } else if (img.isBanner() && bannerUrl == null) {
                        bannerUrl = img.getImageUrl();
                    } else {
                        gallery.add(img.getImageUrl());
                    }
                }
                if (avatarUrl == null && !f.getFactoryImages().isEmpty()) {
                    avatarUrl = f.getFactoryImages().get(0).getImageUrl();
                }
            }

            long pCount = facCount.getOrDefault(f.getId(), 0L);

            return new FactoryItemResponse(
                    f.getId(),
                    f.getName(),
                    f.getAddress(),
                    f.getDescription(),
                    f.getFactoryStatus() != null ? f.getFactoryStatus().name() : "ACTIVE",
                    pCount,
                    avatarUrl,
                    bannerUrl,
                    gallery,
                    null,
                    null,
                    f.getCustomServiceFee() != null ? f.getCustomServiceFee() : 25000.0
            );
        }).toList();
    }

    public FactoryItemResponse getFactoryDetail(Long id) {
        Factory f = factoryRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin xưởng: " + id));

        Map<Long, Long> facCount = productRepo.countByFactory().stream()
                .collect(Collectors.toMap(r -> (Long) r[0], r -> (Long) r[1]));

        String avatarUrl = null;
        String bannerUrl = null;
        List<String> gallery = new ArrayList<>();

        if (f.getFactoryImages() != null) {
            for (FactoryImage img : f.getFactoryImages()) {
                if (img.getImageUrl() == null || img.getImageUrl().isBlank()) continue;
                if (img.isAvatar() && avatarUrl == null) {
                    avatarUrl = img.getImageUrl();
                } else if (img.isBanner() && bannerUrl == null) {
                    bannerUrl = img.getImageUrl();
                } else {
                    gallery.add(img.getImageUrl());
                }
            }
            if (avatarUrl == null && !f.getFactoryImages().isEmpty()) {
                avatarUrl = f.getFactoryImages().get(0).getImageUrl();
            }
        }

        return new FactoryItemResponse(
                f.getId(),
                f.getName(),
                f.getAddress(),
                f.getDescription(),
                f.getFactoryStatus() != null ? f.getFactoryStatus().name() : "ACTIVE",
                facCount.getOrDefault(f.getId(), 0L),
                avatarUrl,
                bannerUrl,
                gallery,
                null,
                null,
                f.getCustomServiceFee() != null ? f.getCustomServiceFee() : 25000.0
        );
    }
}
