package com.nhom10.tmdt.dto.factory;

import com.nhom10.tmdt.enums.ProductStatus;
import com.nhom10.tmdt.enums.ProductType;

public record FactoryProductEditRes(
                                    Long id,
                                    String name,
                                    String category,
                                    ProductType type,
                                    ProductStatus status,
                                    String description
) {
}
