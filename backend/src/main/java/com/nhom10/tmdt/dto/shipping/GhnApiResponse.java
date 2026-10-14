package com.nhom10.tmdt.dto.shipping;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record GhnApiResponse<T>(
        int code,
        String message,
        T data
) {
}
