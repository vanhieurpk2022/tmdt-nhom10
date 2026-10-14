package com.nhom10.tmdt.dto.shipping;

import com.fasterxml.jackson.annotation.JsonProperty;

public record GhnDistrictResponse(
        @JsonProperty("DistrictID")
        Integer districtId,

        @JsonProperty("ProvinceID")
        Integer provinceId,

        @JsonProperty("DistrictName")
        String districtName
) {
}
