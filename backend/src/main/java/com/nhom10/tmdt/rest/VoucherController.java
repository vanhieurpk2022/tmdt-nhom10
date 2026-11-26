package com.nhom10.tmdt.rest;

import com.nhom10.tmdt.dto.ApiResponse;
import com.nhom10.tmdt.dto.order.BuyNowRequest;
import com.nhom10.tmdt.enums.VoucherStatus;
import com.nhom10.tmdt.model.*;
import com.nhom10.tmdt.repo.VoucherRepository;
import com.nhom10.tmdt.security.FactoryAccess;
import com.nhom10.tmdt.service.imp.PurchaseItemService;
import com.nhom10.tmdt.service.order.VoucherService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.security.Principal;
import java.time.LocalDateTime;
import java.util.*;

@RestController @RequiredArgsConstructor
public class VoucherController {
    private final VoucherRepository vouchers;
    private final FactoryAccess access;
    private final VoucherService pricing;
    private final PurchaseItemService purchases;
    public record VoucherInput(@NotBlank @Pattern(regexp = "[A-Za-z0-9_-]{3,32}") String code,
                               @NotBlank @Pattern(regexp = "PERCENT|FIXED") String discountType,
                               @NotNull @Positive Double discountValue, @PositiveOrZero Double maxDiscountAmount,
                               @NotNull @PositiveOrZero Double minOrderValue, @Positive int usageLimit,
                               @NotNull LocalDateTime startDate, @NotNull LocalDateTime endDate,
                               @NotNull VoucherStatus status) {}
    public record VoucherDto(Long id, String code, String discountType, Double discountValue, Double maxDiscountAmount,
                             Double minOrderValue, int usageLimit, int usedCount, LocalDateTime startDate, LocalDateTime endDate, VoucherStatus status) {}
    public record Preview(@NotBlank @Size(max = 32) String code, List<Long> cartItemIds, @Valid BuyNowRequest buyNow) {}
    private boolean admin() { return SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN")); }
    private VoucherDto dto(Voucher v) { return new VoucherDto(v.getId(), v.getCode(), v.getDiscountType(), v.getDiscountValue(), v.getMaxDiscountAmount(), v.getMinOrderValue(), v.getUsageLimit(), v.getUsedCount(), v.getStartDate(), v.getEndDate(), v.getStatus()); }
    private void check(Voucher voucher) {
        if (admin()) return;
        access.owner();
        if (voucher.getFactory() == null || !voucher.getFactory().getId().equals(access.currentUser().getFactory().getId())) throw new ResponseStatusException(HttpStatus.FORBIDDEN);
    }
    @GetMapping({"/admin/vouchers", "/manager/vouchers"}) @Transactional(readOnly = true)
    public ApiResponse<List<VoucherDto>> list() {
        var rows = admin() ? vouchers.findAll() : vouchers.findByFactoryIdOrderByIdDesc(access.currentUser().getFactory().getId());
        return new ApiResponse<>(200, "Mã giảm giá", rows.stream().sorted(Comparator.comparing(Voucher::getId).reversed()).map(this::dto).toList());
    }
    @PostMapping({"/admin/vouchers", "/manager/vouchers"}) @Transactional
    public ApiResponse<VoucherDto> create(@Valid @RequestBody VoucherInput request) {
        Voucher voucher = new Voucher();
        if (!admin()) { access.owner(); voucher.setFactory(access.currentUser().getFactory()); }
        update(voucher, request);
        return new ApiResponse<>(201, "Đã tạo mã", dto(vouchers.saveAndFlush(voucher)));
    }
    @PutMapping({"/admin/vouchers/{id}", "/manager/vouchers/{id}"}) @Transactional
    public ApiResponse<VoucherDto> edit(@PathVariable Long id, @Valid @RequestBody VoucherInput request) {
        var voucher = vouchers.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        check(voucher); update(voucher, request);
        return new ApiResponse<>(200, "Đã cập nhật mã", dto(vouchers.saveAndFlush(voucher)));
    }
    private void update(Voucher v, VoucherInput r) {
        if (!r.endDate().isAfter(r.startDate()) || !Double.isFinite(r.discountValue()) || !Double.isFinite(r.minOrderValue())
                || r.maxDiscountAmount() != null && !Double.isFinite(r.maxDiscountAmount())
                || r.usageLimit() < v.getUsedCount() || "PERCENT".equals(r.discountType()) && r.discountValue() > 100) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Thông số mã giảm giá không hợp lệ");
        var existing = vouchers.findByCode(VoucherService.normalize(r.code()));
        if (existing.isPresent() && !Objects.equals(existing.get().getId(), v.getId())) throw new ResponseStatusException(HttpStatus.CONFLICT, "Mã đã tồn tại");
        if (v.getUsedCount() > 0 && v.getId() != null && (!v.getCode().equalsIgnoreCase(r.code()) || !v.getDiscountValue().equals(r.discountValue())
                || !v.getDiscountType().equals(r.discountType()))) throw new ResponseStatusException(HttpStatus.CONFLICT, "Mã đã dùng chỉ được đổi thời hạn, giới hạn hoặc trạng thái");
        v.setCode(VoucherService.normalize(r.code())); v.setDiscountType(r.discountType()); v.setDiscountValue(r.discountValue());
        v.setMaxDiscountAmount(r.maxDiscountAmount()); v.setMinOrderValue(r.minOrderValue()); v.setUsageLimit(r.usageLimit());
        v.setStartDate(r.startDate()); v.setEndDate(r.endDate()); v.setStatus(r.status());
    }
    @PostMapping("/vouchers/preview") @Transactional(readOnly = true)
    public ApiResponse<Map<String, Long>> preview(@Valid @RequestBody Preview request, Principal principal) {
        var items = request.buyNow() == null ? purchases.selectCartItems(principal.getName(), request.cartItemIds()) : List.of(purchases.resolve(request.buyNow()));
        var factoryIds = items.stream().map(i -> i.getProduct().getFactory().getId()).distinct().toList();
        if (factoryIds.size() != 1) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Chỉ áp dụng mã cho đơn của một xưởng");
        long subtotal = items.stream().mapToLong(i -> Math.multiplyExact(Math.round(purchases.price(i)), i.getQuantity())).sum();
        return new ApiResponse<>(200, "Giá trị giảm", Map.of("discount", pricing.preview(request.code(), subtotal, factoryIds.getFirst()).amount()));
    }
}
