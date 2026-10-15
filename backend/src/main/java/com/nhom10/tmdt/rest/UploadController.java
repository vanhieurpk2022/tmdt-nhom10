package com.nhom10.tmdt.rest;

import com.nhom10.tmdt.dto.ApiResponse;
import com.nhom10.tmdt.dto.upload.DeleteAssetRequest;
import com.nhom10.tmdt.dto.upload.UploadSignatureResponse;
import com.nhom10.tmdt.service.cloudinary.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/uploads")
@RequiredArgsConstructor
public class UploadController {

    private final CloudinaryService cloudinaryService;

    @GetMapping("/signature")
    public ApiResponse<UploadSignatureResponse> getSignature() {
        return new ApiResponse<>(200,"Lấy key thành công", cloudinaryService.generateSignature());
    }

    @DeleteMapping("/uploadsd")
    public ApiResponse<Void> deleteUploads(@RequestBody List<DeleteAssetRequest> assets) throws IOException {
        cloudinaryService.deleteUploads(assets);
        return new ApiResponse<>(200,"Đã xóa thành công");
    }
}
