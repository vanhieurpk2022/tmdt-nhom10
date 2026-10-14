package com.nhom10.tmdt.service.shipping;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nhom10.tmdt.config.GhnShippingProperties;
import com.nhom10.tmdt.dto.shipping.GhnApiResponse;
import com.nhom10.tmdt.dto.shipping.GhnDistrictResponse;
import com.nhom10.tmdt.dto.shipping.GhnFeeRequest;
import com.nhom10.tmdt.dto.shipping.GhnFeeResponse;
import com.nhom10.tmdt.dto.shipping.GhnProvinceResponse;
import com.nhom10.tmdt.dto.shipping.GhnWardResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GhnShippingClient {

    private static final String FEE_ENDPOINT = "/shiip/public-api/v2/shipping-order/fee";
    private static final String PROVINCE_ENDPOINT = "/shiip/public-api/master-data/province";
    private static final String DISTRICT_ENDPOINT = "/shiip/public-api/master-data/district";
    private static final String WARD_ENDPOINT = "/shiip/public-api/master-data/ward";

    private final GhnShippingProperties properties;
    private final ObjectMapper objectMapper;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    public GhnFeeResponse calculateFee(GhnFeeRequest request) {
        if (!properties.isReady()) {
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "Chưa cấu hình đầy đủ thông tin GHN"
            );
        }

        try {
            String requestBody = objectMapper.writeValueAsString(request);
            HttpRequest httpRequest = HttpRequest.newBuilder()
                    .uri(URI.create(properties.normalizedBaseUrl() + FEE_ENDPOINT))
                    .timeout(Duration.ofSeconds(15))
                    .header("Content-Type", "application/json")
                    .header("Token", properties.getToken())
                    .header("ShopId", String.valueOf(properties.getShopId()))
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());
            return parseFeeResponse(response);
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw shippingGatewayException(exception);
        } catch (IOException | IllegalArgumentException exception) {
            throw shippingGatewayException(exception);
        }
    }

    public GhnFeeRequest buildDefaultFeeRequest(int toDistrictId, String toWardCode, int insuranceValue) {
        return buildDefaultFeeRequest(
                toDistrictId,
                toWardCode,
                insuranceValue,
                properties.getDefaultWeight()
        );
    }

    public GhnFeeRequest buildDefaultFeeRequest(int toDistrictId, String toWardCode, int insuranceValue, int weight) {
        return new GhnFeeRequest(
                properties.getFromDistrictId(),
                properties.getFromWardCode(),
                toDistrictId,
                toWardCode,
                properties.getServiceTypeId(),
                Math.max(insuranceValue, 0),
                Math.max(weight, properties.getDefaultWeight()),
                properties.getDefaultLength(),
                properties.getDefaultWidth(),
                properties.getDefaultHeight(),
                null
        );
    }

    public List<GhnProvinceResponse> getProvinces() {
        GhnApiResponse<List<GhnProvinceResponse>> response = get(
                PROVINCE_ENDPOINT,
                new TypeReference<GhnApiResponse<List<GhnProvinceResponse>>>() {
                }
        );
        return response.data() == null ? List.of() : response.data();
    }

    public List<GhnDistrictResponse> getDistricts(int provinceId) {
        GhnApiResponse<List<GhnDistrictResponse>> response = get(
                DISTRICT_ENDPOINT + "?province_id=" + provinceId,
                new TypeReference<GhnApiResponse<List<GhnDistrictResponse>>>() {
                }
        );
        return response.data() == null ? List.of() : response.data();
    }

    public List<GhnWardResponse> getWards(int districtId) {
        GhnApiResponse<List<GhnWardResponse>> response = get(
                WARD_ENDPOINT + "?district_id=" + districtId,
                new TypeReference<GhnApiResponse<List<GhnWardResponse>>>() {
                }
        );
        return response.data() == null ? List.of() : response.data();
    }

    private GhnFeeResponse parseFeeResponse(HttpResponse<String> response) throws IOException {
        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            throw shippingGatewayException(null);
        }

        GhnApiResponse<GhnFeeResponse> apiResponse = objectMapper.readValue(
                response.body(),
                new TypeReference<GhnApiResponse<GhnFeeResponse>>() {
                }
        );

        if (apiResponse.code() != 200 || apiResponse.data() == null) {
            throw shippingGatewayException(null);
        }

        return apiResponse.data();
    }

    private <T> GhnApiResponse<T> get(String endpoint, TypeReference<GhnApiResponse<T>> responseType) {
        if (!properties.isReady()) {
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "Chưa cấu hình đầy đủ thông tin GHN"
            );
        }

        try {
            HttpRequest httpRequest = HttpRequest.newBuilder()
                    .uri(URI.create(properties.normalizedBaseUrl() + endpoint))
                    .timeout(Duration.ofSeconds(15))
                    .header("Token", properties.getToken())
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw shippingGatewayException(null);
            }

            GhnApiResponse<T> apiResponse = objectMapper.readValue(response.body(), responseType);
            if (apiResponse.code() != 200) {
                throw shippingGatewayException(null);
            }

            return apiResponse;
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw shippingGatewayException(exception);
        } catch (IOException | IllegalArgumentException exception) {
            throw shippingGatewayException(exception);
        }
    }

    private ResponseStatusException shippingGatewayException(Throwable cause) {
        return new ResponseStatusException(
                HttpStatus.BAD_GATEWAY,
                "Không tính được phí vận chuyển từ GHN",
                cause
        );
    }
}
