package com.nhom10.tmdt.service.payment;

import com.nhom10.tmdt.config.VnPayProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import java.net.URI;
import java.time.Clock;

@Component
@RequiredArgsConstructor
public class VnPayGatewayProvider {
    private final VnPayProperties properties;
    private final Clock clock;

    /** Local configuration readiness only; this does not contact or certify the merchant at VNPay. */
    public Availability availability() {
        try {
            gateway();
            return new Availability(true, "Thanh toán VNPay sẵn sàng.");
        } catch (ResponseStatusException ex) {
            return new Availability(false, "Thanh toán VNPay hiện chưa sẵn sàng. Vui lòng chọn COD hoặc thử lại sau.");
        }
    }

    public record Availability(boolean available, String message) {}

    public VnPayGateway gateway() {
        if (!properties.isEnabled()) throw unavailable();
        try {
            URI result = properties.getFrontendResultUrl();
            if (result == null || result.getHost() == null || result.getRawUserInfo() != null
                    || result.getRawFragment() != null || result.getRawQuery() != null
                    || !("https".equals(result.getScheme()) || ("http".equals(result.getScheme())
                    && ("localhost".equals(result.getHost()) || "127.0.0.1".equals(result.getHost()))))) throw unavailable();
            return new VnPayGateway(properties.getTmnCode(), properties.getHashSecret(),
                    properties.getPayUrl(), properties.getReturnUrl(), clock);
        } catch (IllegalArgumentException ex) { throw unavailable(); }
    }

    private ResponseStatusException unavailable() {
        return new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "VNPay chưa được cấu hình hợp lệ");
    }
}
