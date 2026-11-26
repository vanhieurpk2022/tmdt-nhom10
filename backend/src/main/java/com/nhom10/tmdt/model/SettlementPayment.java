package com.nhom10.tmdt.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/** Biên nhận chuyển tiền được quản trị viên ghi nhận, không tự chuyển tiền qua ngân hàng. */
@Entity @Table(name = "settlement_payment")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class SettlementPayment {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "factory_id", nullable = false) private Factory factory;
    @Column(nullable = false) private long amount;
    private long grossSales;
    private long platformFee;
    private double platformFeeRate;
    private String bankName;
    private String accountNumber;
    private String accountHolder;
    @Column(nullable = false, unique = true, length = 100) private String transactionCode;
    @Column(length = 500) private String note;
    private String disbursedBy;
    private LocalDateTime disbursedAt;
}
