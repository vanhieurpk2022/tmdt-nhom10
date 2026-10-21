package com.nhom10.tmdt.service.factory;

import com.nhom10.tmdt.dto.factory.*;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

public interface FactoryDashboardService {
    public DashboardOverviewResponse getOverview(String email);
    List<FactoryOrderDashBoardResponse> factoryGetUser(String email);

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
}
