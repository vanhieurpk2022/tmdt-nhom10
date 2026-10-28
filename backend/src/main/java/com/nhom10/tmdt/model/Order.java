package com.nhom10.tmdt.model;

import com.nhom10.tmdt.enums.CancelReason;
import com.nhom10.tmdt.enums.OrderStatus;
import com.nhom10.tmdt.enums.PaymentMethod;
import com.nhom10.tmdt.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.time.Instant;
import java.util.List;

@Entity
@Table(name = "orders", uniqueConstraints = @UniqueConstraint(name = "uk_order_checkout", columnNames = {"user_id", "checkout_key"}))
@Getter
@Setter
@ToString
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Column(name = "payable_amount_vnd", updatable = false)
    private Long payableAmountVnd;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", length = 32)
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    @Column(name = "reservation_expires_at", updatable = false)
    private Instant reservationExpiresAt;

    @Builder.Default
    @Column(name = "stock_held", nullable = false, columnDefinition = "boolean default false")
    private boolean stockHeld = false;

    @Column(name = "paid_attempt_id")
    private Long paidAttemptId;

    @Column(name = "checkout_key", length = 80, updatable = false)
    private String checkoutKey;

    @Column(name = "checkout_fingerprint", length = 64, updatable = false)
    private String checkoutFingerprint;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @OneToMany(mappedBy = "order")
    private List<Voucher> vouchers;

    @OneToMany(mappedBy = "order")
    private List<OrderItem> orderItems;

    @OneToMany(mappedBy = "order")
    private List<Refund> refunds;

    @Column(name = "subtotal_price", nullable = false)
    private Double subtotalPrice;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private OrderStatus status;

    @Column(name = "total_price", nullable = false)
    private Double totalPrice;

    @Column(name = "discount_amount", nullable = false)
    private Double discountAmount;

    @Column(name = "shipping_fee")
    private Double shippingFee;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method")
    private PaymentMethod paymentMethod;

    @Column(name = "recipient_name")
    private String recipientName;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Column(name = "shipping_address")
    private String shippingAddress;

    @Column(name = "note")
    private String note;

    @Enumerated(EnumType.STRING)
    @Column(name = "cancel_reason")
    private CancelReason cancelReason;

    @Column(name = "cancelled_at")
    private Instant cancelledAt;

    @Column(name = "cancelled_by", length = 255)
    private String cancelledBy;

    @Column(name = "cancellation_note", length = 500)
    private String cancellationNote;

    @Column(name = "stock_restored_at")
    private Instant stockRestoredAt;

    @Column(name = "delivered_at")
    private LocalDateTime deliveredAt;

    @Column(name = "expected_delivery_at")
    private LocalDateTime expectedDeliveryAt;

    @Column(name = "created_at", nullable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;

}
