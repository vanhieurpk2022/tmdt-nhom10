package com.nhom10.tmdt.dto.factory;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.web.multipart.MultipartFile;

public record RegisterFactoryRequest(
        @NotBlank(message = "Tên gian hàng không được để trống")
        String name,

        @NotBlank(message = "Địa chỉ kho không được để trống")
        String address,

        @NotBlank(message = "Tên chủ tài khoản không được để trống")
        String accountHolder,

        @NotBlank(message = "Số tài khoản không được để trống")
        String accountNumber,

        @NotBlank(message = "Số điện thoại không được để trống")
        String shopPhone,

        @NotBlank(message = "Họ và tên người đại diện không được để trống")
        String fullNameRepre,

        @NotBlank(message = "Số CCCD/Mã số thuế không được để trống")
        String identity,

        // 0: cá nhân, 1: doanh nghiệp
        @NotNull(message = "Loại hình hoạt động không được để trống")
        Integer typeFactory,

        // URL file đã upload lên Cloudinary từ frontend
        @NotBlank(message = "Vui lòng tải lên CCCD hoặc Giấy phép ĐKKD")
        String licenseUrl,

        String cosmeticLicenseUrl,
        String tccsDocUrl,

        @NotBlank(message = "Vui lòng tải lên hóa đơn chứng minh nguồn gốc")
        String originInvoiceUrl,

        String brandAuthorizationUrl
) {
}
