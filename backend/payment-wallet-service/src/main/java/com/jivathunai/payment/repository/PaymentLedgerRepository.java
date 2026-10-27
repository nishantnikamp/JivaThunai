package com.jivathunai.payment.repository;

import com.jivathunai.payment.entity.PaymentLedger;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentLedgerRepository extends JpaRepository<PaymentLedger, UUID> {
    Optional<PaymentLedger> findByRazorpayOrderId(String razorpayOrderId);
    Optional<PaymentLedger> findByRazorpayPaymentId(String razorpayPaymentId);
    Optional<PaymentLedger> findByInternalOrderId(String internalOrderId);
}
