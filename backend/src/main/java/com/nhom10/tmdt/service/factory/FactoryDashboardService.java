package com.nhom10.tmdt.service.factory;

import com.nhom10.tmdt.dto.factory.*;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

public interface FactoryDashboardService {
    public DashboardOverviewResponse getOverview(String email);
    List<FactoryOrderDashBoardResponse> factoryGetUser(String email);

    FactoryProductResponse factoryProductRes(String email);

    FactoryProductModalResponse createProduct(@RequestBody FactoryProductModalRequest request, String email);
}
