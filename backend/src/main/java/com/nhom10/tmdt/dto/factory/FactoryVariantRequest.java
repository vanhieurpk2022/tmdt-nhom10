package com.nhom10.tmdt.dto.factory;

public record FactoryVariantRequest(
                                      Integer mil,
                                      double price,
                                      double basePrice,
                                      int stockQuantity
                                     ) {
}
