package com.nhom10.tmdt.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

public interface CloudinarySevice {
    public String getUrlImage(MultipartFile file);
}
