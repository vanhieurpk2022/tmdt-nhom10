package com.nhom10.tmdt.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "payment_retry_key", uniqueConstraints = @UniqueConstraint(name = "uk_payment_retry", columnNames = {"order_id", "request_key"}))
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class PaymentRetryKey {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "order_id", nullable = false, updatable = false)
    private Long orderId;
    @Column(name = "request_key", nullable = false, updatable = false, length = 80)
    private String requestKey;
    @Column(name = "attempt_id", nullable = false, updatable = false)
    private Long attemptId;
}
