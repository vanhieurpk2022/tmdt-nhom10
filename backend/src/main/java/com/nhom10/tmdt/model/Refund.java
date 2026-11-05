package com.nhom10.tmdt.model;

import com.nhom10.tmdt.enums.RefundStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "refund", uniqueConstraints = {
        @UniqueConstraint(name = "uk_refund_request", columnNames = {"order_id", "request_key"}),
        @UniqueConstraint(name = "uk_refund_provider_request", columnNames = "provider_request_id")
}, indexes = {
        @Index(name = "ix_refund_queue", columnList = "status,id"),
        @Index(name = "ix_refund_payment_attempt", columnList = "payment_attempt_id,order_id,id")
})
@Getter
@Setter
@ToString
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Refund {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;


    private String reason;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "varchar(32)", length = 32)
    @ColumnDefault("'REQUESTED'")
    private RefundStatus status = RefundStatus.REQUESTED;

    @Column(name = "amount_vnd")
    private Long amountVnd;

    @Column(name = "payment_attempt_id", updatable = false)
    private Long paymentAttemptId;

    @Column(name = "request_key", length = 80, updatable = false)
    private String requestKey;

    @Column(name = "requested_by", length = 255, updatable = false)
    private String requestedBy;

    @Column(name = "approved_by", length = 255)
    private String approvedBy;

    @Column(name = "approved_at")
    private Instant approvedAt;

    @Column(name = "provider_request_id", length = 32)
    private String providerRequestId;

    @Column(name = "provider_requested_at")
    private Instant providerRequestedAt;

    @Column(name = "provider_response_id", length = 32)
    private String providerResponseId;

    @Column(name = "provider_transaction_no", length = 15)
    private String providerTransactionNo;

    @Column(name = "provider_response_code", length = 2)
    private String providerResponseCode;

    @Column(name = "provider_transaction_status", length = 2)
    private String providerTransactionStatus;

    @Column(name = "processed_by", length = 255)
    private String processedBy;

    @Column(name = "last_error", length = 500)
    private String lastError;

    @Column(name = "legacy_status", length = 32, updatable = false)
    private String legacyStatus;

    @Version
    @Column(nullable = false)
    @ColumnDefault("0")
    private long version;

    @Column(name = "created_at")
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column(name = "processed_at")
    private LocalDateTime processedAt;

    @ManyToOne
    @JoinColumn(name = "order_id")
    private Order order;

    @OneToMany(mappedBy = "refund")
    private List<RefundEvidence> refundEvidenceList;

}
