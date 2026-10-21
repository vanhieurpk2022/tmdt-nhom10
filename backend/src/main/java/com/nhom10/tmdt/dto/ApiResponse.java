package com.nhom10.tmdt.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.Data;
import lombok.Getter;
import org.springframework.http.ResponseEntity;

@Getter
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({"status","message","data"})
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


}
