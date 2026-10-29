package com.nhom10.tmdt.rest;

import com.nhom10.tmdt.dto.ApiResponse;
import com.nhom10.tmdt.dto.factory.FactoryItemResponse;
import com.nhom10.tmdt.dto.factory.FactoryRegisterRequest;
import com.nhom10.tmdt.dto.factory.FactoryRegisterResponse;
import com.nhom10.tmdt.service.factory.FactoryService;
import com.nhom10.tmdt.dto.product.CategoryDto;
import com.nhom10.tmdt.service.imp.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/factories")
public class FactoryController {

    private final FactoryService factoryService;
    private final ProductService productService;

    /**
     * GET /api/factories
     * Lấy danh sách xưởng đối tác hiển thị cho khách hàng
     */
    @GetMapping
    public ApiResponse<List<FactoryItemResponse>> getAllFactories() {
        return new ApiResponse<>(200, "Lấy danh sách xưởng thành công", factoryService.getAllFactories());
    }

    /**
     * GET /api/factories/{id}
     * Lấy chi tiết thông tin xưởng
     */
    @GetMapping("/{id}")
    public ApiResponse<FactoryItemResponse> getFactoryDetail(@PathVariable Long id) {
        return new ApiResponse<>(200, "Lấy thông tin chi tiết xưởng thành công", factoryService.getFactoryDetail(id));
    }


    @GetMapping("/{id}/categories")
    public ApiResponse<List<CategoryDto>> getFactoryCategories(@PathVariable Long id) {
        return new ApiResponse<>(200, "Lấy danh mục của xưởng thành công", productService.getFactoryCategories(id));
    }

    // nhận nhiều file
    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<Void> registerFactory(@Valid @RequestBody FactoryRegisterRequest request, @AuthenticationPrincipal UserDetails userDetails) {
        factoryService.registerFactory(request,userDetails.getUsername());
        return new ApiResponse<Void>(201,"Đăng kí người bán thành công");
    }

}
