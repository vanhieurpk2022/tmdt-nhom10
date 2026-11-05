package com.nhom10.tmdt.dto.admin;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.nhom10.tmdt.enums.CancelReason;
import com.nhom10.tmdt.enums.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class UpdateOrderStatusRequest {
    private OrderStatus status;
    private CancelReason cancelReason;
    private String note;
}
