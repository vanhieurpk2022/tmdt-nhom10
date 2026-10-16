package com.nhom10.tmdt.service.factory;

import com.nhom10.tmdt.dto.factory.FactoryItemResponse;
import com.nhom10.tmdt.dto.factory.RegisterFactoryRequest;

import java.util.List;

public interface FactoryService {
    List<FactoryItemResponse> getAllFactories();
    FactoryItemResponse getFactoryDetail(Long id);
    void registerFactory(RegisterFactoryRequest request);
}
