package com.nhom10.tmdt.rest;

import com.nhom10.tmdt.enums.RefundStatus;
import com.nhom10.tmdt.service.payment.RefundService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
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

    @GetMapping
    public ResponseEntity<List<RefundService.Summary>> list(@RequestParam(required = false) Long orderId,
            @RequestParam(required = false) RefundStatus status, @RequestParam(defaultValue = "0") int page) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(refunds.list(orderId, status, page));
    }

    @GetMapping("/{id}")
    public ResponseEntity<RefundService.Summary> get(@PathVariable Long id) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(refunds.get(id));
    }

    @PostMapping("/{id}/approve")
    public RefundService.Summary approve(@PathVariable Long id, Authentication auth) {
        return refunds.approve(id, auth.getName());
    }

    @PostMapping("/{id}/reject")
    public RefundService.Summary reject(@PathVariable Long id, @Valid @RequestBody Note body, Authentication auth) {
        return refunds.reject(id, body.note(), auth.getName());
    }

    @PostMapping("/{id}/complete")
    public RefundService.Summary complete(@PathVariable Long id, @Valid @RequestBody Completion body, Authentication auth) {
        return refunds.complete(id, body.succeeded(), body.note(), auth.getName());
    }

    public record Note(@Size(max = 500) String note) {}
    public record Completion(@NotNull Boolean succeeded, @Size(max = 500) String note) {}
}
