package com.nhom10.tmdt.service.factory;

import com.nhom10.tmdt.dto.factory.DashboardOverviewResponse;
import com.nhom10.tmdt.dto.factory.FactoryOrderDashBoardResponse;
import com.nhom10.tmdt.dto.factory.FactoryProductResponse;

import java.util.List;

public interface FactoryDashboardService {
    public DashboardOverviewResponse getOverview(String email);
    List<FactoryOrderDashBoardResponse> factoryGetUser(String email);

    FactoryProductResponse factoryProductRes(String email);
}
