package com.nhom10.tmdt.dto.product;

import java.util.List;

public record FilterMetaResponse(
        List<CategoryDto> categories,
        List<FactoryDto> factories
) {}
