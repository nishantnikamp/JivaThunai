package com.jivathunai.payment.entity;

import com.jivathunai.payment.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "payment_ledger", indexes = {
    @Index(name = "idx_razorpay_payment_id", columnList = "razorpayPaymentId", unique = true),
    @Index(name = "idx_razorpay_order_id", columnList = "razorpayOrderId", unique = true)
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentLedger {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, updatable = false)
    private String internalOrderId;

    @Column(nullable = false, updatable = false, unique = true)
    private String razorpayOrderId;

    @Column(unique = true)
    private String razorpayPaymentId;

    @Column(nullable = false)
    private BigDecimal amount; // Stored in INR (not paisa for DB readability, or strictly paisa if requested. We'll store INR)

    @Column(length = 100)
    private String customerName;

    @Column(length = 100)
    private String customerEmail;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PaymentStatus status;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
