package com.nhom10.tmdt.dto.factory;

import java.time.LocalDateTime;

public record FactoryProductItem(Long id,
                                 String name,
                                 long stock,
                                 long sold,
                                 LocalDateTime createdAt,
                                 String category) {}
