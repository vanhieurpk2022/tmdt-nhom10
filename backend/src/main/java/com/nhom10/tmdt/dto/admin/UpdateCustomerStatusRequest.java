package com.nhom10.tmdt.dto.admin;

import com.nhom10.tmdt.enums.UserStatus;

public record UpdateCustomerStatusRequest(
        UserStatus status
) {
}