package com.nhom10.tmdt.dto.admin;

import com.nhom10.tmdt.enums.ProductStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProductStatusRequest {
    @NotNull(message = "Trạng thái không được để trống")
    private ProductStatus status;
}

