package com.nhom10.tmdt.config;

import com.nhom10.tmdt.dto.ApiResponse;
import com.nhom10.tmdt.config.AppException;
import com.nhom10.tmdt.enums.ErrorCode;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler{

    // bắt lỗi nghiệp vụ
        @ExceptionHandler(AppException.class)
        public ResponseEntity<ApiResponse<Void>> globalExceptionHander(AppException ex){
            ErrorCode er = ex.getErrorCode();
            ApiResponse<Void> apiResponse = new ApiResponse<>(er.getCode(),er.getMessage());
            return ResponseEntity.status(er.getCode()).body(apiResponse);
        }

    // Lỗi validation (@Valid thất bại)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(f -> f.getField() + ": " + f.getDefaultMessage())
                .collect(Collectors.joining("; "));
        ApiResponse<Void> body = new ApiResponse<>(HttpStatus.BAD_REQUEST.value(), message);
        return ResponseEntity.badRequest().body(body);
    }
}
