package com.nhom10.tmdt.dto.factory;

import com.nhom10.tmdt.enums.ProductStatus;
import com.nhom10.tmdt.enums.ProductType;
import lombok.Builder;

@Builder
public record FactoryProductModalResponse(
      String name,
                                          Long categoryId,
                                          ProductType type,
                                          ProductStatus status,
                                          String description,
                                          String[] imageUrls) {
}
