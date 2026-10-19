package com.nhom10.tmdt.service.payment;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import java.math.BigDecimal;

/** Existing catalog uses Double; convert each price BEFORE any arithmetic. Never round. */
public final class VndMoney {
    private VndMoney() {}
    public static long exact(Double value) {
        try {
            if (value == null || !Double.isFinite(value)) throw new ArithmeticException();
            long amount = BigDecimal.valueOf(value).longValueExact();
            if (amount < 0 || amount > VnPayGateway.MAX_AMOUNT_VND) throw new ArithmeticException();
            return amount;
        } catch (ArithmeticException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Giá tiền phải là số nguyên VND hợp lệ");
        }
    }
}
