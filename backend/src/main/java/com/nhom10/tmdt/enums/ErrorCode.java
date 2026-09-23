package com.nhom10.tmdt.enums;

import lombok.Getter;

@Getter
public enum ErrorCode {
    BAD_REQUEST(400, "Dữ liệu không hợp lệ"),
    UNAUTHORIZED(401, "Chưa xác thực"),
    FORBIDDEN(403, "Không có quyền truy cập"),
    NOT_FOUND(404, "Không tìm thấy tài nguyên yêu cầu"),
    EXPIRED(410, "Đường dẫn chia sẻ đã hết hạn"),
    INTERNAL_ERROR(500, "Lỗi hệ thống");

   private final int code;
   private final String message;

    ErrorCode(int code, String message ){
       this.code =code;
       this.message = message;
   }

}
