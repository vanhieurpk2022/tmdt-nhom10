package com.nhom10.tmdt.dto.shipping;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public record GhnWardResponse(
        @JsonProperty("WardCode")
        String wardCode,

        @JsonProperty("WardName")
        String wardName
) {
}
