package com.nhom10.tmdt.service.cloudinary;

import com.nhom10.tmdt.dto.upload.DeleteAssetRequest;
import com.nhom10.tmdt.dto.upload.UploadSignatureResponse;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface CloudinaryService {
    public String getUrlImage(MultipartFile file);
    UploadSignatureResponse generateSignature();
    void deleteUploads(List<DeleteAssetRequest> rq) throws IOException;
}
