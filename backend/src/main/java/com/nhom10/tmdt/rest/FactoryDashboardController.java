package com.nhom10.tmdt.rest;

import com.cloudinary.Api;
import com.nhom10.tmdt.dto.ApiResponse;
import com.nhom10.tmdt.dto.factory.DashboardOverviewResponse;
import com.nhom10.tmdt.dto.factory.FactoryOrderDashBoardResponse;
import com.nhom10.tmdt.dto.factory.FactoryProductResponse;
import com.nhom10.tmdt.dto.product.ProductCreateMilRequest;
import com.nhom10.tmdt.dto.product.ProductCreateMilResponse;
import com.nhom10.tmdt.dto.product.ToggleMilStatusRequest;
import com.nhom10.tmdt.dto.product.ToggleMilStatusResponse;
import com.nhom10.tmdt.model.ProductMil;
import com.nhom10.tmdt.service.factory.FactoryDashboardService;
import com.nhom10.tmdt.service.imp.ProductService;
import com.nhom10.tmdt.service.productmil.ProductMilService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/manager")
@RequiredArgsConstructor
public class FactoryDashboardController {

    private final FactoryDashboardService factoryDashboard;
    private final ProductMilService productMilService;

    @GetMapping("/dashboard/overview")
    public ApiResponse<DashboardOverviewResponse> overview(
            @AuthenticationPrincipal UserDetails user) {
        String email = user.getUsername();
        DashboardOverviewResponse dashboardOverviewResponse = factoryDashboard.getOverview(email);
        return new ApiResponse<>(200,"Lấy dữ liệu thành công",dashboardOverviewResponse);
    }



    @GetMapping("/dashboard/user")
    public ApiResponse<List<FactoryOrderDashBoardResponse>> getTableUser(
            @AuthenticationPrincipal UserDetails user) {
        String email = user.getUsername();
        List<FactoryOrderDashBoardResponse> dashboardOverviewResponse = factoryDashboard.factoryGetUser(email);
        return new ApiResponse<>(200,"Lấy dữ liệu thành công",dashboardOverviewResponse);
    }

    @PostMapping("/products")
    public ApiResponse<> createProduct(){
        return null;
    }

    @GetMapping("/products")
    public ApiResponse<FactoryProductResponse> products(@AuthenticationPrincipal UserDetails userDetails){
        return new ApiResponse<>(200,"Lấy thành công products", factoryDashboard.factoryProductRes(userDetails.getUsername()));
    }
    @GetMapping("/products/{productId}/mils")
    public ApiResponse<List<ProductMil>> getTableUser(@PathVariable Long productId) {
        return new ApiResponse<>(200,"Lấy dữ liệu thành công",productMilService.productMils(productId));
    }
    @PostMapping("/products/{productId}/mils")
    public ApiResponse<ProductCreateMilResponse> createProductMil(@PathVariable Long productId, @RequestBody ProductCreateMilRequest data){
        return new ApiResponse<>(200,"Thêm thành công",productMilService.createProductMil(productId,data));
    }
    @PutMapping("/products/{productId}/mils/{milId}")
    public ApiResponse<ProductCreateMilResponse> updateProductMil(@PathVariable Long productId, @PathVariable Long milId, @RequestBody  ProductCreateMilRequest data){
        return new ApiResponse<>(200,"Thêm thành công",productMilService.updateProductMil(productId,milId,data));
    }

    @DeleteMapping("/products/{productId}/mils/{milId}")
    public ApiResponse<Boolean> deleteProductMil( @PathVariable Long productId, @PathVariable Long milId){
        productMilService.deleteProductMil(productId,milId);
        return new ApiResponse<>(200, "Xóa biến thể thành công",true);
    }

    @PatchMapping("/products/{productId}/mils/{milId}/status")
    public ApiResponse<ToggleMilStatusResponse> toggleStatusProductMil(@PathVariable Long productId, @PathVariable Long milId, @RequestBody ToggleMilStatusRequest request){

        return new ApiResponse<>(200, "Mở thành công", productMilService.toggleStatusProductMil(productId,milId,request));
    }
}