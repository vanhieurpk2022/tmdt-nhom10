package com.nhom10.tmdt.dto.admin;

import com.nhom10.tmdt.enums.FactoryStatus;
import lombok.Builder;

@Builder
public record FactoryRegisterResponse(
        Long id,
        String name,
        String address,
        FactoryStatus factoryStatus,
        String avatarUrl,
        String identity,
        String licenseUrl,
        String originInvoiceUrl,
        String tcssDocUrl
) {
}
