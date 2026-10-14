package com.nhom10.tmdt.dto.shipping;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record GhnFeeRequest(
        @JsonProperty("from_district_id")
        int fromDistrictId,

        @JsonProperty("from_ward_code")
        String fromWardCode,

        @JsonProperty("to_district_id")
        int toDistrictId,

        @JsonProperty("to_ward_code")
        String toWardCode,

        @JsonProperty("service_type_id")
        int serviceTypeId,

        @JsonProperty("insurance_value")
        int insuranceValue,

        int weight,

        int length,

        int width,

        int height,

        String coupon
) {
}
