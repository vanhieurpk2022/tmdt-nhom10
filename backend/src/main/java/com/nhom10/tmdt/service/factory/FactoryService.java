package com.nhom10.tmdt.service.factory;

import com.nhom10.tmdt.dto.factory.FactoryItemResponse;
import com.nhom10.tmdt.dto.factory.FactoryRegisterRequest;
import com.nhom10.tmdt.dto.factory.DashboardOverviewResponse;

import java.util.List;

public interface FactoryService {
    List<FactoryItemResponse> getAllFactories();
    FactoryItemResponse getFactoryDetail(Long id);
    void registerFactory(FactoryRegisterRequest request, String email);
    DashboardOverviewResponse getStaticsFactory(String id);
}
