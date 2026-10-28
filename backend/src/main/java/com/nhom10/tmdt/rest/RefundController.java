package com.nhom10.tmdt.rest;

import com.nhom10.tmdt.enums.RefundStatus;
import com.nhom10.tmdt.service.payment.RefundService;
import com.nhom10.tmdt.service.payment.VnPayRefundService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/admin/payments/refunds")
public class RefundController {
    private final RefundService refunds;
    private final VnPayRefundService provider;

    @GetMapping
    public ResponseEntity<List<RefundService.Summary>> list(@RequestParam(required = false) Long orderId,
            @RequestParam(defaultValue = "REQUESTED") RefundStatus status, @RequestParam(defaultValue = "0") int page) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(refunds.list(orderId, status, page));
    }

    @GetMapping("/{id}")
    public ResponseEntity<RefundService.Summary> get(@PathVariable Long id) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(refunds.get(id));
    }

    @PostMapping
    public RefundService.Summary request(@Valid @RequestBody Request body,
            @RequestHeader("Idempotency-Key") String key, Authentication auth) {
        return refunds.request(body.paymentAttemptId(), key, body.reason().trim(), auth.getName());
    }

    @PostMapping("/{id}/approve")
    public RefundService.Summary approve(@PathVariable Long id, @Valid @RequestBody Evidence body, Authentication auth) {
        return refunds.decide(id, true, body.evidence().trim(), auth.getName());
    }

    @PostMapping("/{id}/reject")
    public RefundService.Summary reject(@PathVariable Long id, @Valid @RequestBody Evidence body, Authentication auth) {
        return refunds.decide(id, false, body.evidence().trim(), auth.getName());
    }

    @PostMapping("/{id}/process")
    public RefundService.Summary process(@PathVariable Long id, Authentication auth) {
        return provider.process(id, auth.getName());
    }

    @PostMapping("/{id}/refresh")
    public RefundService.Summary refresh(@PathVariable Long id) {
        return provider.refresh(id);
    }

    @PostMapping("/{id}/reconcile")
    public RefundService.Summary reconcile(@PathVariable Long id, @Valid @RequestBody Reconciliation body, Authentication auth) {
        return refunds.reconcile(id, body.providerRequestId(), body.status(), body.transactionNo(),
                body.evidence().trim(), auth.getName());
    }

    public record Request(@NotNull @Positive Long paymentAttemptId, @NotBlank @Size(max = 255) String reason) {}
    public record Evidence(@NotBlank @Size(min = 20, max = 500) String evidence) {}
    public record Reconciliation(@NotBlank @Pattern(regexp = "[A-Za-z0-9]{32}") String providerRequestId,
            @NotNull RefundStatus status,
            @NotBlank @Pattern(regexp = "(?!0+$)[0-9]{1,15}") String transactionNo,
            @NotBlank @Size(min = 20, max = 500) String evidence) {}
}
