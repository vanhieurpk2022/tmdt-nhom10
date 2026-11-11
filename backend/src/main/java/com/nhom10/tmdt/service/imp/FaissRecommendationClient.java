package com.nhom10.tmdt.service.imp;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.ArrayList;
import java.util.List;

@Service
public class FaissRecommendationClient {

    private static final Logger log = LoggerFactory.getLogger(FaissRecommendationClient.class);
    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper;
    private final String baseUrl;

    public FaissRecommendationClient(
            ObjectMapper objectMapper,
            @Value("${chatbot.base-url:http://localhost:8000}") String baseUrl
    ) {
        this.objectMapper = objectMapper;
        this.baseUrl = baseUrl.replaceAll("/+$", "");
    }

    public List<Long> findSimilarProductIds(Long productId, int limit) {
        try {
            URI uri = URI.create(baseUrl + "/api/recommendations/" + productId + "?limit=" + limit);
            HttpRequest request = HttpRequest.newBuilder(uri)
                    .timeout(java.time.Duration.ofSeconds(10))
                    .GET()
                    .build();
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() / 100 != 2) {
                log.warn("FAISS recommendation service returned HTTP {}", response.statusCode());
                return List.of();
            }

            JsonNode ids = objectMapper.readTree(response.body()).path("product_ids");
            List<Long> result = new ArrayList<>();
            ids.forEach(id -> {
                if (id.canConvertToLong()) {
                    result.add(id.longValue());
                }
            });
            return result;
        } catch (Exception exception) {
            log.warn("Unable to query FAISS recommendation service for product {}", productId, exception);
            return List.of();
        }
    }
}
