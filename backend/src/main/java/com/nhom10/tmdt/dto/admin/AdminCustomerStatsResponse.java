package com.nhom10.tmdt.dto.admin;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminCustomerStatsResponse {
    private long totalCustomers;
    private long activeCustomers;
    private long bannedCustomers;
    private long inactiveCustomers;
    private double totalRevenue;
}