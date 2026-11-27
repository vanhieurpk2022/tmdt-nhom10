package com.nhom10.tmdt.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "factory_settlement")
@Getter
@Setter
@ToString
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FactorySettlement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "factory_id", nullable = false)
    private Factory factory;

    @Column(name = "amount", nullable = false)
    private Double amount; // Số tiền thực tế giải ngân đợt này

    @Column(name = "gross_sales", nullable = false)
    private Double grossSales; // Tổng tiền hàng đơn hoàn tất tính cho đợt

    @Column(name = "platform_fee", nullable = false)
    private Double platformFee; // Phí sàn khấu trừ

    @Column(name = "platform_fee_rate", nullable = false)
    private Double platformFeeRate; // Tỷ lệ phí sàn (ví dụ 0.08 = 8%)

    @Column(name = "bank_name", length = 100)
    private String bankName;

    @Column(name = "account_number", length = 50)
    private String accountNumber;

    @Column(name = "account_holder", length = 120)
    private String accountHolder;

    @Column(name = "transaction_code", length = 100)
    private String transactionCode; // Mã giao dịch ngân hàng / Ref

    @Column(name = "note", length = 500)
    private String note;

    @Column(name = "status", length = 32, nullable = false)
    @Builder.Default
    private String status = "COMPLETED";

    @Column(name = "disbursed_by", length = 120)
    private String disbursedBy;

    @Column(name = "created_at", nullable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;
}

