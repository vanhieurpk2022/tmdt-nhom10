package com.nhom10.tmdt.dto.order;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.Locale;
import java.text.Normalizer;

public record RefundBankAccount(
        @NotBlank(message = "Vui lòng chọn ngân hàng nhận hoàn tiền")
        @Size(max = 120, message = "Tên ngân hàng không quá 120 ký tự") String bankName,
        @NotBlank(message = "Vui lòng nhập số tài khoản nhận hoàn tiền")
        @Pattern(regexp = "[0-9]{4,30}", message = "Số tài khoản phải gồm 4–30 chữ số") String accountNumber,
        @NotBlank(message = "Vui lòng nhập tên chủ tài khoản")
        @Pattern(regexp = "[A-Z][A-Z ]{1,119}", message = "Tên chủ tài khoản phải gồm 2–120 ký tự chữ không dấu và dấu cách") String accountHolder,
        @NotNull(message = "Vui lòng xác nhận thông tin nhận hoàn tiền")
        @AssertTrue(message = "Vui lòng xác nhận thông tin nhận hoàn tiền") Boolean confirmed
) {
    public RefundBankAccount {
        bankName = bankName == null ? null : bankName.trim();
        accountNumber = accountNumber == null ? null : accountNumber.trim();
        accountHolder = accountHolder == null ? null : Normalizer.normalize(accountHolder, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "").replace('đ', 'D').replace('Đ', 'D').trim().replaceAll("\\s+", " ").toUpperCase(Locale.ROOT);
    }
}
