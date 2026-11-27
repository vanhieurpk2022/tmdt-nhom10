package com.nhom10.tmdt.dto.factory;

import jakarta.validation.constraints.NotBlank;

public record FactoryProfileUpdateRequest(
        @NotBlank(message = "Tên gian hàng không được để trống")
        String name,
        String owner,
        String phone,
        String address,
        String description,
        String taxCode,
        String businessLicense,
        String website,
        String avatarUrl
) {}

