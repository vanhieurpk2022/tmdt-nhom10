package com.nhom10.tmdt.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "ghn")
public class GhnShippingProperties {

    private String baseUrl = "https://dev-online-gateway.ghn.vn";
    private String token = "";
    private int shopId;
    private int fromProvinceId;
    private int fromDistrictId;
    private String fromWardCode = "";
    private String fromAddress = "";
    private int serviceTypeId = 2;
    private int defaultWeight = 500;
    private int defaultLength = 20;
    private int defaultWidth = 15;
    private int defaultHeight = 10;

    public String normalizedBaseUrl() {
        if (baseUrl == null || baseUrl.isBlank()) {
            return "https://dev-online-gateway.ghn.vn";
        }

        String normalized = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
        String apiPath = "/shiip/public-api";
        if (normalized.endsWith(apiPath)) {
            return normalized.substring(0, normalized.length() - apiPath.length());
        }
        return normalized;
    }

    public boolean hasToken() {
        return token != null && !token.isBlank();
    }

    public boolean isReady() {
        return hasToken()
                && shopId > 0
                && fromDistrictId > 0
                && fromWardCode != null
                && !fromWardCode.isBlank();
    }
}
