package com.nhom10.tmdt.rest;

import com.nhom10.tmdt.dto.ApiResponse;
import com.nhom10.tmdt.dto.admin.FactoryRegisterResponse;
import com.nhom10.tmdt.dto.factory.FactoryUpdateRoleRequest;
import com.nhom10.tmdt.service.admin.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/admin")
public class AdminController {

    private final AdminService adminService;

    // khi bỏ /id -> @PathVariable
    // nếu sử dụng @RequiestParam nó tự bỏ rồi
    @GetMapping("/register-factory")
    public ApiResponse<List<FactoryRegisterResponse>> getFactoryRegister(){
        List<FactoryRegisterResponse> factory = adminService.factoryRegister();
        return new ApiResponse<>(200,"Lấy thành công", factory);
    }
    @PatchMapping("/update-role")
    public ApiResponse<Void> updateRoleForFactory(@RequestBody FactoryUpdateRoleRequest request){
                adminService.FactoryUpdateRole(request);
        return new ApiResponse<>(200,"Cập nhật role thành công~");
    }
}
