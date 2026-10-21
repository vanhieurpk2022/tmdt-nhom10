package com.nhom10.tmdt.dto.admin;

import com.nhom10.tmdt.dto.address.AddressResponse;
import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminCustomerDetailResponse {
    private AdminCustomerResponse customer;
    private List<AddressResponse> addresses;
    private List<AdminCustomerOrderSummary> recentOrders;
    private List<AdminCustomerRefundSummary> disputes;
    private List<AdminCustomerFormulaSummary> formulas;
}