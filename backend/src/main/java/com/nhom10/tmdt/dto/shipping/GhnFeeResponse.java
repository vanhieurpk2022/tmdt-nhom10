package com.nhom10.tmdt.dto.shipping;

import com.fasterxml.jackson.annotation.JsonProperty;

public record GhnFeeResponse(
        Integer total,

        @JsonProperty("service_fee")
        Integer serviceFee,

        @JsonProperty("insurance_fee")
        Integer insuranceFee,

        @JsonProperty("pick_station_fee")
        Integer pickStationFee,

        @JsonProperty("coupon_value")
        Integer couponValue,

        @JsonProperty("r2s_fee")
        Integer r2sFee
) {
    public int totalOrZero() {
        return total == null ? 0 : total;
    }
}
