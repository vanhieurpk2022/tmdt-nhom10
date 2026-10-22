package com.nhom10.tmdt.dto.admin;

import java.util.List;

public record UpdateCustomerRolesRequest(
        List<String> roleNames
) {
}