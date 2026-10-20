package com.nhom10.tmdt.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

/** Durable outbox and reconciliation queue. Contains no address, secret or raw callback. */
@Entity
@Table(name = "payment_event", uniqueConstraints = @UniqueConstraint(name = "uk_payment_event", columnNames = "event_key"))
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class PaymentEvent {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "event_key", nullable = false, length = 180)
    private String eventKey;
    @Column(nullable = false)
    private Long orderId;
    private Long attemptId;
    @Column(nullable = false, length = 40)
    private String type;
    @Column(nullable = false, length = 32)
    private String status;
    @Column(nullable = false)
    private Instant createdAt;
    private Instant resolvedAt;
    @Column(length = 500)
    private String resolutionNote;
    @Column(length = 255)
    private String resolvedBy;
}
