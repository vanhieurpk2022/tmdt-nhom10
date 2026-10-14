package com.nhom10.tmdt.dto.shipping;

public record GhnApiResponse<T>(
        int code,
        String message,
        T data
) {
}
