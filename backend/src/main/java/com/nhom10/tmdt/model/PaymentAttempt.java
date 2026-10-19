package com.nhom10.tmdt.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "payment_attempt", uniqueConstraints = {
        @UniqueConstraint(name = "uk_payment_ref", columnNames = "txn_ref"),
        @UniqueConstraint(name = "uk_payment_receipt", columnNames = {"merchant_code", "receipt_no"})})
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class PaymentAttempt {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "order_id", nullable = false, updatable = false)
    private Long orderId;
    @Column(nullable = false, updatable = false, length = 16)
    private String provider;
    @Column(name = "merchant_code", nullable = false, updatable = false, length = 8)
    private String merchantCode;
    @Column(name = "txn_ref", nullable = false, updatable = false, length = 100)
    private String txnRef;
    @Column(name = "amount_vnd", nullable = false, updatable = false)
    private long amountVnd;
    @Column(nullable = false, updatable = false, length = 3)
    private String currency;
    @Column(nullable = false, length = 32)
    private String status;
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
    @Column(name = "expires_at", nullable = false, updatable = false)
    private Instant expiresAt;
    @Column(name = "payment_url", nullable = false, updatable = false, columnDefinition = "text")
    private String paymentUrl;
    private Instant receivedAt;
    @Column(length = 15)
    private String transactionNo;
    // NULL on failures: MySQL allows multiple NULL values in the receipt unique key.
    @Column(name = "receipt_no", length = 15)
    private String receiptNo;
    @Column(length = 20)
    private String bankCode;
    @Column(length = 2)
    private String responseCode;
    @Column(length = 2)
    private String providerTransactionStatus;
    @Column(length = 14)
    private String payDate;
    @Column(length = 64)
    private String callbackFingerprint;
}
