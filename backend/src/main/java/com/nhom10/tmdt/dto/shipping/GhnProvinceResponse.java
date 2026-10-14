package com.nhom10.tmdt.dto.shipping;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public record GhnProvinceResponse(
        @JsonProperty("ProvinceID")
        Integer provinceId,

        @JsonProperty("ProvinceName")
        String provinceName
) {
}
