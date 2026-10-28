package com.nhom10.tmdt.service.factory;

import com.nhom10.tmdt.dto.factory.*;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;

import java.time.LocalDate;
import java.util.List;

public interface FactoryDashboardService {
    public DashboardOverviewResponse getOverview(String email);
    List<FactoryOrderDashBoardResponse> factoryGetUser(String email);
    List<FactoryChartOrderResponse> getChartOrders(String email, LocalDate from, LocalDate to);
    List<FactoryOrderStatusCount> getOrderStatusCounts(String email);

    FactoryProductResponse factoryProductRes(String email);
    List<FactoryVariantRes> getProductMil( Long productId);
    FactoryProductModalResponse createProduct(@RequestBody FactoryProductModalRequest request, String email);
    void updateThumbnail(Long imageId, Long productId);
    void deleteThumbnail( Long id);
    void updateFactoryProductMil( Long milId,  FactoryVariantRequest request);

    FactoryProductEditRes getProductEdit(Long productId);
    void changeStatusProductMils(Long milId);

    void updateProductEdit(Long id, FactoryProductEditRequest request);

    void changeStatusProducts(Long id, ChangeStatusProduct req);

    void DeleteProduct(Long id);

    FactoryCustomRecipeDto getCustomRecipe(Long productId);

    FactoryCustomRecipeDto saveCustomRecipe(Long productId, FactoryCustomRecipeSaveRequest request);

    List<FactoryStaffResponse> getStaffs(String email);

    FactoryStaffResponse createStaff(String email, FactoryStaffCreateRequest request);

    FactoryStaffResponse updateStaff(String email, Long staffId, FactoryStaffUpdateRequest request);

    void deleteStaff(String email, Long staffId);
}

