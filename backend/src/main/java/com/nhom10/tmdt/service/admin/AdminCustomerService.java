package com.nhom10.tmdt.service.admin;

import com.nhom10.tmdt.dto.admin.*;
import com.nhom10.tmdt.enums.UserStatus;

import java.util.List;

public interface AdminCustomerService {
    AdminCustomerPageResponse getCustomers(int page, int size, String search, UserStatus status, String role, String sortBy, String sortDir);
    AdminCustomerStatsResponse getCustomerStats();
    AdminCustomerDetailResponse getCustomerDetail(Long id);
    AdminCustomerResponse updateCustomerStatus(Long id, UserStatus newStatus);
    AdminCustomerResponse updateCustomerRoles(Long id, List<String> roleNames);
    AdminCustomerResponse updateCustomerInfo(Long id, UpdateCustomerInfoRequest request);
    void deleteCustomer(Long id);
}