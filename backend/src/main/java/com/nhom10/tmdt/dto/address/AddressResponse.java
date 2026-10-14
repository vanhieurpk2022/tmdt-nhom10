package com.nhom10.tmdt.dto.address;

// DTO phản hồi thông tin địa chỉ người dùng
public record AddressResponse(
        Long id,
        String recipentName,
        String phoneNumber,
        String street,
        String ward,
        String district,
        String city,
        boolean isDefault
) {
}
