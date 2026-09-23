package com.nhom10.tmdt.service.imp;

import com.cloudinary.Cloudinary;
import com.cloudinary.api.exceptions.ApiException;
import com.nhom10.tmdt.config.AppException;
import com.nhom10.tmdt.enums.ErrorCode;
import com.nhom10.tmdt.service.CloudinarySevice;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CloudinarySeviceImp implements CloudinarySevice {
    @Value("${cloudinary.folder}")
    private String folder;

    private final Cloudinary cloudinary;


    @Override
    public String getUrlImage(MultipartFile file) {
        try {
            Map<String, Object> option = new HashMap<>();
            option.put("folder",folder);

            Map result = cloudinary.uploader().upload(file.getBytes(),option);
            // lưu thông tin file lại

            return result.get("secure_url").toString();
        }catch (Exception ex){
            throw new AppException(ErrorCode.NOT_FOUND);
        }
    }
}
