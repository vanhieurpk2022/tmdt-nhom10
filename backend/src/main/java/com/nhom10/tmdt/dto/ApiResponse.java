package com.nhom10.tmdt.dto;

import lombok.Data;
import lombok.Getter;

@Getter
public class ApiResponse<T>   {
    private final int status;
    private final String message;
    private final T data;

    public ApiResponse(int status, String message, T data){
        this.status= status;
        this.message=message;
        this.data = data;
    }
    public ApiResponse(int status, String message){
        this(status,message,null);
    }

    public static <T> ApiResponse<T> response(int status, String message, T data){
        return new ApiResponse<>(status,message,data);
    }
}
