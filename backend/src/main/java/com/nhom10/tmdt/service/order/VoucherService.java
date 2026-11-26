package com.nhom10.tmdt.service.order;

import com.nhom10.tmdt.enums.VoucherStatus;
import com.nhom10.tmdt.model.Voucher;
import com.nhom10.tmdt.repo.VoucherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.time.LocalDateTime;
import java.util.Locale;

@Service @RequiredArgsConstructor
public class VoucherService {
    private final VoucherRepository vouchers;
    public record Discount(Voucher voucher, long amount) {}
    public Discount preview(String code, long subtotal, Long factoryId) {
        if (code == null || code.isBlank()) return new Discount(null, 0);
        return calculate(vouchers.findByCode(normalize(code)).orElseThrow(() -> invalid("Mã giảm giá không tồn tại")), subtotal, factoryId);
    }
    @Transactional(propagation = Propagation.MANDATORY)
    public Discount reserve(String code, long subtotal, Long factoryId) {
        if (code == null || code.isBlank()) return new Discount(null, 0);
        Voucher voucher = vouchers.lockByCode(normalize(code)).orElseThrow(() -> invalid("Mã giảm giá không tồn tại"));
        Discount result = calculate(voucher, subtotal, factoryId);
        voucher.setUsedCount(Math.addExact(voucher.getUsedCount(), 1));
        return result;
    }
    public Discount calculate(Voucher voucher, long subtotal, Long factoryId) {
        LocalDateTime now = LocalDateTime.now();
        if (voucher.getStatus() != VoucherStatus.ACTIVE || voucher.getStartDate() == null || voucher.getEndDate() == null
                || now.isBefore(voucher.getStartDate()) || now.isAfter(voucher.getEndDate())
                || voucher.getUsedCount() >= voucher.getUsageLimit()) throw invalid("Mã giảm giá chưa có hiệu lực, đã hết hạn hoặc hết lượt");
        if (voucher.getFactory() != null && !voucher.getFactory().getId().equals(factoryId)) throw invalid("Mã giảm giá không áp dụng cho xưởng này");
        if (subtotal < (voucher.getMinOrderValue() == null ? 0 : voucher.getMinOrderValue())) throw invalid("Đơn chưa đạt giá trị tối thiểu của mã giảm giá");
        double value = voucher.getDiscountValue() == null ? 0 : voucher.getDiscountValue();
        if (!Double.isFinite(value) || value <= 0 || "PERCENT".equals(voucher.getDiscountType()) && value > 100) throw invalid("Mã giảm giá chưa được cấu hình hợp lệ");
        long amount = "PERCENT".equals(voucher.getDiscountType()) ? Math.round(subtotal * value / 100) : Math.round(value);
        if (voucher.getMaxDiscountAmount() != null && voucher.getMaxDiscountAmount() > 0) amount = Math.min(amount, Math.round(voucher.getMaxDiscountAmount()));
        return new Discount(voucher, Math.min(Math.max(0, subtotal - 1), amount));
    }
    @Transactional(propagation = Propagation.MANDATORY)
    public void release(Voucher voucher) {
        if (voucher == null) return;
        var locked = vouchers.lockByCode(voucher.getCode()).orElseThrow(() -> invalid("Không tìm thấy mã đã áp dụng"));
        locked.setUsedCount(Math.max(0, locked.getUsedCount() - 1));
    }
    public static String normalize(String code) { return code.trim().toUpperCase(Locale.ROOT); }
    private static ResponseStatusException invalid(String message) { return new ResponseStatusException(HttpStatus.BAD_REQUEST, message); }
}
