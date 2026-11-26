package com.nhom10.tmdt.rest;

import com.nhom10.tmdt.repo.*;
import com.nhom10.tmdt.security.FactoryAccess;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.*;

@RestController @RequiredArgsConstructor
public class FactoryProductImagesController {
    private final ProductRepository products;
    private final ProductImageRepository images;
    private final FactoryAccess access;

    public record Image(Long id, String imageUrl, boolean thumbnail, boolean customSample, boolean customExample) {}

    @GetMapping("/manager/products/{id}/images") @Transactional(readOnly = true)
    public Map<String, Object> images(@PathVariable Long id) {
        access.product(products.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND)));
        return Map.of("_embedded", Map.of("productImages", images.findByProductId(id).stream()
                .map(i -> new Image(i.getId(), i.getImageUrl(), i.isThumbnail(), i.isCustomSample(), i.isCustomExample())).toList()));
    }
}
