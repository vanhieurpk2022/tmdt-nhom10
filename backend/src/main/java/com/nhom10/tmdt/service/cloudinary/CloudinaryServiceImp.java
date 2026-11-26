package com.nhom10.tmdt.service.cloudinary;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.nhom10.tmdt.config.AppException;
import com.nhom10.tmdt.dto.upload.DeleteAssetRequest;
import com.nhom10.tmdt.dto.upload.UploadSignatureResponse;
import com.nhom10.tmdt.enums.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class CloudinaryServiceImp implements CloudinaryService {
    @Value("${cloudinary.folder}")
    private String folder;
    private static final Set<String> RESOURCE_TYPES = Set.of("image", "raw", "video");
    private static final int MAX_ITEMS = 10;

    private final Cloudinary cloudinary;
    private final com.nhom10.tmdt.repo.UserRepository users;

    private String ownFolder() {
        var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) throw new AppException(ErrorCode.UNAUTHORIZED);
        var user = users.findByEmail(auth.getName()).orElseThrow(() -> new AppException(ErrorCode.UNAUTHORIZED));
        return folder + "/users/" + user.getId();
    }


    @Override
    public String getUrlImage(MultipartFile file) {
        try {
            Map<String, Object> option = new HashMap<>();
            option.put("folder", ownFolder());

            Map result = cloudinary.uploader().upload(file.getBytes(), option);
            // lưu thông tin file lại

            return result.get("secure_url").toString();
        } catch (Exception ex) {
            throw new AppException(ErrorCode.NOT_FOUND);
        }
    }

    @Override
    public UploadSignatureResponse generateSignature() {
        String folder = ownFolder();
        long timestamp = System.currentTimeMillis() / 1000;

        Map<String, Object> params = new HashMap<>();
        params.put("timestamp", timestamp);
        params.put("folder", folder);

        String signature = cloudinary.apiSignRequest(params, cloudinary.config.apiSecret, 1);

        return new UploadSignatureResponse(
                signature,
                timestamp,
                cloudinary.config.apiKey,
                cloudinary.config.cloudName,
                folder
        );
    }
    @Override
    public void deleteUploads(List<DeleteAssetRequest> rq) throws IOException {
        String allowedPrefix = ownFolder() + "/";
        if (rq == null || rq.isEmpty() || rq.size() > MAX_ITEMS) throw new AppException(ErrorCode.BAD_REQUEST);
        for (DeleteAssetRequest a : rq) {
            if (a == null || a.publicId() == null || !a.publicId().startsWith(allowedPrefix)
                    || a.publicId().contains("..") || !RESOURCE_TYPES.contains(a.resourceType())) {
                throw new AppException(ErrorCode.FORBIDDEN);
            }
        }
        for (DeleteAssetRequest a : rq) {
            cloudinary.uploader().destroy(a.publicId(), ObjectUtils.asMap(
                    "resource_type", a.resourceType(),
                    "invalidate", true
            ));
        }
    }
}
