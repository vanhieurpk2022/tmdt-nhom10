package com.nhom10.tmdt.dto.address;

// DTO tiếp nhận dữ liệu thêm mới hoặc cập nhật địa chỉ
public record AddressRequest(
        String recipentName,
        String phoneNumber,
        String street,
        String ward,
        String district,
        String city,
        Boolean isDefault
) {
}
