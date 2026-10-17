package com.nhom10.tmdt.dto.factory;

import com.nhom10.tmdt.enums.FactoryStatus;
import jakarta.validation.constraints.NotNull;

public record FactoryUpdateRoleRequest(
        Long id, FactoryStatus factoryStatus) {
}
