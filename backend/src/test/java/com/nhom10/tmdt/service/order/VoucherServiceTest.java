package com.nhom10.tmdt.service.order;

import com.nhom10.tmdt.enums.VoucherStatus;
import com.nhom10.tmdt.model.*;
import com.nhom10.tmdt.repo.VoucherRepository;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;
import java.time.LocalDateTime;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class VoucherServiceTest {
    private final VoucherService service = new VoucherService(mock(VoucherRepository.class));
    private Voucher voucher() {
        return Voucher.builder().code("TEST10").discountType("PERCENT").discountValue(10.0).minOrderValue(200000.0)
                .maxDiscountAmount(50000.0).usageLimit(5).usedCount(0).status(VoucherStatus.ACTIVE)
                .startDate(LocalDateTime.now().minusDays(1)).endDate(LocalDateTime.now().plusDays(1)).build();
    }
    @Test void capsPercentageDiscount() { assertEquals(50000, service.calculate(voucher(), 1000000, 1L).amount()); }
    @Test void rejectsInsufficientSubtotal() { assertThrows(ResponseStatusException.class, () -> service.calculate(voucher(), 100000, 1L)); }
    @Test void rejectsAnotherFactoryCoupon() {
        var voucher = voucher(); voucher.setFactory(Factory.builder().id(2L).build());
        assertThrows(ResponseStatusException.class, () -> service.calculate(voucher, 300000, 1L));
    }
    @Test void rejectsExhaustedCoupon() {
        var voucher = voucher(); voucher.setUsedCount(5);
        assertThrows(ResponseStatusException.class, () -> service.calculate(voucher, 300000, 1L));
    }
}
