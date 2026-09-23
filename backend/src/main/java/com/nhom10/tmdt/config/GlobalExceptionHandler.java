package com.nhom10.tmdt.config;

import com.nhom10.tmdt.dto.ApiResponse;
import com.nhom10.tmdt.config.AppException;
import com.nhom10.tmdt.enums.ErrorCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler{

        @ExceptionHandler(AppException.class)
        public ResponseEntity<ApiResponse<Void>> globalExceptionHander(AppException ex){
            ErrorCode er = ex.getErrorCode();
            ApiResponse<Void> apiResponse = new ApiResponse<>(er.getCode(),er.getMessage());
            return ResponseEntity.status(er.getCode()).body(apiResponse);
        }
}
