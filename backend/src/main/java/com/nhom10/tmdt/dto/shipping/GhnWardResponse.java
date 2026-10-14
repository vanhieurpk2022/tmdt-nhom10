package com.nhom10.tmdt.dto.shipping;

import com.fasterxml.jackson.annotation.JsonProperty;

public record GhnWardResponse(
        @JsonProperty("WardCode")
        String wardCode,

        @JsonProperty("WardName")
        String wardName
) {
}
