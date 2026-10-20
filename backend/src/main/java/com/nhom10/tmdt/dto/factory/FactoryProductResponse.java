package com.nhom10.tmdt.dto.factory;

import com.nhom10.tmdt.enums.ProductStatus;
import com.nhom10.tmdt.enums.ProductType;
import com.nhom10.tmdt.model.Product;

import java.time.LocalDateTime;
import java.util.List;

public record FactoryProductResponse(FactoryProductStats stats,
                                     List<FactoryProductItem> products) {}