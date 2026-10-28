package com.nhom10.tmdt.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import java.net.URI;

@Component
@ConfigurationProperties(prefix = "vnpay")
@Getter @Setter
public class VnPayProperties {
    private boolean enabled;
    private String tmnCode;
    private String hashSecret;
    private URI payUrl = URI.create("https://sandbox.vnpayment.vn/paymentv2/vpcpay.html");
    private URI queryUrl = URI.create("https://sandbox.vnpayment.vn/merchant_webapi/api/transaction");
    private URI refundUrl = URI.create("https://sandbox.vnpayment.vn/merchant_webapi/api/transaction");
    private String serverIp = "127.0.0.1";
    private URI returnUrl = URI.create("http://localhost:8080/payments/vnpay/return");
    private URI frontendResultUrl = URI.create("http://localhost:5173/payment/vnpay/result");
}
