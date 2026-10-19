package com.nhom10.tmdt.rest;

import com.nhom10.tmdt.dto.ApiResponse;
import com.nhom10.tmdt.dto.factory.*;
import com.nhom10.tmdt.dto.product.ProductCreateMilRequest;
import com.nhom10.tmdt.dto.product.ProductCreateMilResponse;
import com.nhom10.tmdt.dto.product.ToggleMilStatusRequest;
import com.nhom10.tmdt.dto.product.ToggleMilStatusResponse;
import com.nhom10.tmdt.dto.productimage.ProductImagetThumbnailRequest;
import com.nhom10.tmdt.model.ProductMil;
import com.nhom10.tmdt.service.factory.FactoryDashboardService;
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

    @GetMapping("/productMils/{productId}")
    public ApiResponse<List<FactoryVariantRes>> getProductMil(@PathVariable Long productId){

        return new ApiResponse<>(200," lấy thành công",factoryDashboard.getProductMil(productId));
    }

    @PostMapping("/products")
    public ApiResponse<FactoryProductModalResponse> createProduct(@RequestBody FactoryProductModalRequest request, @AuthenticationPrincipal UserDetails userDetails){
        return new ApiResponse<>(200,"Tạo thành công",factoryDashboard.createProduct(request,userDetails.getUsername()));
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

    @DeleteMapping("/products/{milId}/mils")
    public ApiResponse<Boolean> deleteProductMil( @PathVariable Long milId){
        productMilService.deleteProductMil(milId);
        return new ApiResponse<>(200, "Xóa biến thể thành công",true);
    }

    @PatchMapping("/products/{productId}/mils/{milId}/status")
    public ApiResponse<ToggleMilStatusResponse> toggleStatusProductMil(@PathVariable Long productId, @PathVariable Long milId, @RequestBody ToggleMilStatusRequest request){

        return new ApiResponse<>(200, "Mở thành công", productMilService.toggleStatusProductMil(productId,milId,request));
    }

    @PatchMapping("/product-images/{id}/thumbnail")
    public ApiResponse<Void> updateThumbnail(@PathVariable Long id, @RequestBody ProductImagetThumbnailRequest request){
        factoryDashboard.updateThumbnail(id,request.productId());
        return new ApiResponse<>(200,"Cập nhật thành công");
    }
    @DeleteMapping("/product-images/{id}/thumbnail")
    public ApiResponse<Void> deleteThumbnail(@PathVariable Long id){
        factoryDashboard.deleteThumbnail(id);
        return new ApiResponse<>(200,"Xóa thành công");
    }

    @PatchMapping("/product-mil/{milId}/mil")
    public ApiResponse<Void> updateFactoryProductMil(@PathVariable Long milId, @RequestBody FactoryVariantRequest request){
        factoryDashboard.updateFactoryProductMil(milId,request);
        return new ApiResponse<>(200,"Đã update Thành công");
    }

    @GetMapping("/product-mil/{milId}/mil")
    public ApiResponse<Void> changeStatusProductMils(@PathVariable Long milId){
        factoryDashboard.changeStatusProductMils(milId);
        return new ApiResponse<>(200,"Đã update Thành công");
    }
}