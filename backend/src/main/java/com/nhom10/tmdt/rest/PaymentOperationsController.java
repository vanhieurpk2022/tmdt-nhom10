package com.nhom10.tmdt.rest;

import com.nhom10.tmdt.service.payment.PaymentOperationsService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController @RequiredArgsConstructor
public class PaymentOperationsController {
    private final PaymentOperationsService operations;

    @GetMapping("/admin/payments/orders/{id}/attempts")
    public ResponseEntity<?> attempts(@PathVariable Long id) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(operations.attempts(id));
    }

    @GetMapping("/admin/payments/reviews")
    public ResponseEntity<?> reviews(@RequestParam(defaultValue = "0") int page) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(operations.reviews(page));
    }
    @PostMapping("/admin/payments/reviews/{id}/resolve")
    public void resolve(@PathVariable Long id, @Valid @RequestBody Resolution body, Authentication auth) {
        operations.resolve(id, body.evidence(), auth.getName());
    }
    @PostMapping("/admin/payments/attempts/{id}/reconcile")
    public Object reconcile(@PathVariable Long id, @Valid @RequestBody Reconciliation body, Authentication auth) {
        if ("00".equals(body.responseCode()) && "00".equals(body.transactionStatus()) && (body.transactionNo() == null || !body.transactionNo().matches("[0-9]{1,15}")
                || new java.math.BigInteger(body.transactionNo()).signum() == 0)) {
            throw new org.springframework.web.server.ResponseStatusException(HttpStatus.BAD_REQUEST, "Thiếu mã giao dịch thực tế");
        }
        return java.util.Map.of("result", operations.reconcile(id, body.responseCode(), body.transactionStatus(), body.transactionNo(),
                body.bankCode(), body.payDate(), body.evidence(), auth.getName()));
    }
    public record Resolution(@NotBlank @Size(min = 20, max = 500) String evidence) {}
    public record Reconciliation(@NotBlank @Pattern(regexp = "[0-9]{2}") String responseCode,
            @NotBlank @Pattern(regexp = "[0-9]{2}") String transactionStatus,
            @NotBlank @Pattern(regexp = "[0-9]{1,15}") String transactionNo,
            @NotBlank @Pattern(regexp = "[A-Za-z0-9]{3,20}") String bankCode,
            @NotBlank @Pattern(regexp = "[0-9]{14}") String payDate,
            @NotBlank @Size(min = 20, max = 500) String evidence) {}
}
