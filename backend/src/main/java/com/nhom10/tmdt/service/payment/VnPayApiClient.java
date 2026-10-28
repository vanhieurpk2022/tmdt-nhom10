package com.nhom10.tmdt.service.payment;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Map;

@Component
public class VnPayApiClient {
    private final ObjectMapper mapper = new ObjectMapper().enable(JsonParser.Feature.STRICT_DUPLICATE_DETECTION);
    private final HttpClient client = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(3))
            .followRedirects(HttpClient.Redirect.NEVER).build();

    static void validateEndpoint(URI endpoint) {
        if (endpoint == null || !"https".equals(endpoint.getScheme()) || endpoint.getHost() == null
                || endpoint.getRawUserInfo() != null || endpoint.getRawQuery() != null
                || endpoint.getRawFragment() != null) throw new IllegalArgumentException("Invalid VNPay API URL");
    }

    public Map<String, String> post(URI endpoint, Map<String, String> payload) throws IOException, InterruptedException {
        validateEndpoint(endpoint);
        HttpRequest request = HttpRequest.newBuilder(endpoint).timeout(Duration.ofSeconds(6))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(mapper.writeValueAsString(payload))).build();
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() != 200 || response.body().length() > 65_536) {
            throw new IOException("Invalid VNPay API response");
        }
        Map<String, String> result = mapper.readValue(response.body(), new TypeReference<>() {});
        if (result == null) throw new IOException("Missing VNPay API response");
        return result;
    }
}
