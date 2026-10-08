package com.nhom10.tmdt.enums;

import lombok.Getter;

@Getter
public enum ErrorCode {
    BAD_REQUEST(400, "Dữ liệu không hợp lệ"),
    UNAUTHORIZED(401, "Chưa xác thực"),
    FORBIDDEN(403, "Không có quyền truy cập"),
    NOT_FOUND(404, "Không tìm thấy tài khoản"),
    EXPIRED(410, "Đường dẫn chia sẻ đã hết hạn"),
    INTERNAL_ERROR(500, "Lỗi hệ thống"),
    EMAIL_EXISTED(409, "Email đã tồn tại"),
    INVALID_CREDENTIALS(401,"Tài khoản hoặc mật khẩu không chính xác"),
    ROLE_NOT_FOUND(404, "Không tìm thấy quyền"),
    VERIFY_EMAIL(410,"Vui lòng xác thực email"),
    VERIFY_CODE_EXPIRED(401,"Đường dẫn xác thực đã hết thời hạn"),
    VERIFY_CODE_FAIL(401,"Vui lòng kiểm tra lại mã xác thực"),
    NOT_MATCH_PASSWORD(401, "Mật khẩu không khớp"),
    VERIFY(401, "Tài khoản đã được xác thực");

   private final int code;
   private final String message;

    ErrorCode(int code, String message ){
       this.code =code;
       this.message = message;
   }

}
