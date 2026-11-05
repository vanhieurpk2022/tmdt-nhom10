package com.nhom10.tmdt.dto.order;

import com.nhom10.tmdt.enums.CancelReason;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CancelOrderRequest(
        @NotNull(message = "Vui lòng chọn lý do hủy đơn") CancelReason reason,
        @Size(max = 500, message = "Ghi chú hủy đơn không quá 500 ký tự") String note
) {}
