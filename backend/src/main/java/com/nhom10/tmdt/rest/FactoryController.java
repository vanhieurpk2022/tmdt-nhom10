package com.nhom10.tmdt.rest;

import com.nhom10.tmdt.dto.ApiResponse;
import com.nhom10.tmdt.dto.factory.FactoryItemResponse;
import com.nhom10.tmdt.dto.factory.RegisterFactoryRequest;
import com.nhom10.tmdt.dto.upload.DeleteAssetRequest;
import com.nhom10.tmdt.service.factory.FactoryService;
import com.nhom10.tmdt.service.factory.FactoryServiceImp;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/factories")
public class FactoryController {

    private final FactoryService factoryService;

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


    // nhận nhiều file
    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<FactoryItemResponse> registerFactory(@Valid @RequestBody RegisterFactoryRequest request) {
        factoryService.registerFactory(request);
        return new ApiResponse<>(201,"Đăng kí người bán thành công");
    }

}
