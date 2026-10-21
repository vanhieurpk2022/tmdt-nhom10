package com.nhom10.tmdt.rest;

import com.nhom10.tmdt.config.VnPayProperties;
import com.nhom10.tmdt.dto.ApiResponse;
import com.nhom10.tmdt.dto.order.*;
import com.nhom10.tmdt.service.payment.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.net.URI;
import java.util.Map;

@RestController @RequiredArgsConstructor @Slf4j
@RequestMapping("/payments/vnpay")
public class VnPayController {
    private final VnPayGatewayProvider gateways;
    private final VnPayPaymentService payments;
    private final VnPayQueryService queries;
    private final VnPayProperties properties;

    @GetMapping("/availability")
    public ResponseEntity<ApiResponse<VnPayGatewayProvider.Availability>> availability() {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(new ApiResponse<>(200,
                "Trạng thái phương thức thanh toán", gateways.availability()));
    }

    @GetMapping("/checkout-status")
    public ResponseEntity<ApiResponse<PaymentResponse>> recover(Authentication auth, @RequestParam String key) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(new ApiResponse<>(200,
                "Yêu cầu thanh toán trước", payments.recoverCheckout(auth.getName(), key)));
    }

    @PostMapping("/checkout")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<PaymentResponse> checkout(Authentication auth, @Valid @RequestBody CreateOrderRequest body,
            @RequestHeader("Idempotency-Key") String key, HttpServletRequest request) {
        return new ApiResponse<>(201, "Đã tạo yêu cầu thanh toán", payments.checkout(auth.getName(), body, key, request.getRemoteAddr()));
    }

    @PostMapping("/orders/{id}/retry")
    public ApiResponse<PaymentResponse> retry(Authentication auth, @PathVariable Long id,
            @RequestHeader("Idempotency-Key") String key, HttpServletRequest request) {
        return new ApiResponse<>(200, "Yêu cầu thanh toán", payments.retry(auth.getName(), id, key, request.getRemoteAddr()));
    }

    @GetMapping("/ipn")
    public ResponseEntity<Map<String, String>> ipn(HttpServletRequest request) {
        String code;
        try {
            var callback = gateways.gateway().validateCallback(VnPayQueryParser.parse(request.getQueryString()));
            code = payments.apply(callback);
        } catch (VnPayGateway.InvalidCallback ex) { code = ex.rspCode(); }
        catch (RuntimeException ex) {
            log.error("VNPay IPN was not committed: {}", ex.getClass().getSimpleName());
            code = "99";
        }
        String message = switch (code) {
            case "00" -> "Confirm Success";
            case "02" -> "Order already confirmed";
            case "01" -> "Order not found";
            case "04" -> "Invalid amount";
            case "97" -> "Invalid signature or merchant";
            default -> "Unable to process";
        };
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(Map.of("RspCode", code, "Message", message));
    }

    @GetMapping("/return")
    public ResponseEntity<Void> paymentReturn(HttpServletRequest request) {
        // Validate, then redirect only the reference to the app; no order lookup, no mutation.
        String suffix;
        try {
            var callback = gateways.gateway().validateCallback(VnPayQueryParser.parse(request.getQueryString()));
            suffix = "?ref=" + callback.txnRef();
        } catch (RuntimeException ex) { suffix = "?invalid=1"; }
        return ResponseEntity.status(HttpStatus.SEE_OTHER).cacheControl(CacheControl.noStore())
                .header("Referrer-Policy", "no-referrer")
                .location(URI.create(properties.getFrontendResultUrl().toASCIIString() + suffix)).build();
    }

    @GetMapping("/status")
    public ResponseEntity<ApiResponse<PaymentStatusResponse>> status(Authentication auth, @RequestParam String ref) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(new ApiResponse<>(200,
                "Trạng thái thanh toán", queries.status(auth.getName(), null, ref)));
    }
}
