package com.nhom10.tmdt.dto.admin;

public record UpdateCustomerInfoRequest(
        String fullname,
        String phone,
        String birthday,
        String gender
) {
}