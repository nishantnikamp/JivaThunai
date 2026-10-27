package com.jivathunai.payment.service;

import com.jivathunai.payment.dto.PaymentOrderRequest;
import com.jivathunai.payment.dto.PaymentOrderResponse;
import com.jivathunai.payment.dto.PaymentVerificationRequest;
import com.jivathunai.payment.dto.PaymentVerificationResponse;
import com.jivathunai.payment.entity.PaymentLedger;
import com.jivathunai.payment.enums.PaymentStatus;
import com.jivathunai.payment.repository.PaymentLedgerRepository;
import com.razorpay.Order;
import com.razorpay.Payment;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final RazorpayClient razorpayClient;
    private final PaymentLedgerRepository ledgerRepository;
    private final EmailNotificationService emailNotificationService;

    @Value("${razorpay.api.key.secret}")
    private String keySecret;
    
    @Value("${razorpay.webhook.secret}")
    private String webhookSecret;

    @Transactional
    public PaymentOrderResponse createOrder(PaymentOrderRequest request) throws RazorpayException {
        // Convert amount to paisa (amount * 100)
        BigDecimal amountInPaisa = request.amount().multiply(new BigDecimal("100"));

        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount", amountInPaisa.longValue());
        orderRequest.put("currency", request.currency() != null ? request.currency() : "INR");
        orderRequest.put("receipt", request.internalReferenceId());

        Order razorpayOrder = razorpayClient.orders.create(orderRequest);
        String razorpayOrderId = razorpayOrder.get("id");

        PaymentLedger ledger = PaymentLedger.builder()
                .internalOrderId(request.internalReferenceId())
                .razorpayOrderId(razorpayOrderId)
                .amount(request.amount())
                .customerName(request.customerName())
                .customerEmail(request.customerEmail())
                .status(PaymentStatus.PENDING)
                .build();

        ledgerRepository.save(ledger);

        return new PaymentOrderResponse(
                razorpayOrderId,
                request.internalReferenceId(),
                request.amount(),
                request.currency() != null ? request.currency() : "INR",
                "PENDING"
        );
    }

    @Transactional
    public PaymentVerificationResponse verifyCallback(PaymentVerificationRequest request) {
        try {
            // Step 1: Cryptographic signature validation
            JSONObject options = new JSONObject();
            options.put("razorpay_order_id", request.razorpayOrderId());
            options.put("razorpay_payment_id", request.razorpayPaymentId());
            options.put("razorpay_signature", request.razorpaySignature());

            boolean isValid = Utils.verifyPaymentSignature(options, keySecret);
            if (!isValid) {
                log.error("Invalid payment signature for order: {}", request.razorpayOrderId());
                return new PaymentVerificationResponse(false, "Invalid cryptographic signature", null, "FAILED");
            }

            // Step 2: Fetch Payment directly from Razorpay to assure integrity
            Payment payment = razorpayClient.payments.fetch(request.razorpayPaymentId());
            String status = payment.get("status");

            if (!"captured".equals(status)) {
                log.error("Payment status is not captured: {}", status);
                return new PaymentVerificationResponse(false, "Payment not captured at gateway", null, "FAILED");
            }

            // Step 3: Transactional Idempotency Update
            Optional<PaymentLedger> ledgerOpt = ledgerRepository.findByRazorpayOrderId(request.razorpayOrderId());
            if (ledgerOpt.isEmpty()) {
                return new PaymentVerificationResponse(false, "Internal order not found", null, "FAILED");
            }

            PaymentLedger ledger = ledgerOpt.get();
            if (ledger.getStatus() == PaymentStatus.PAID) {
                // Idempotency: Already paid (maybe handled by webhook first)
                return new PaymentVerificationResponse(true, "Payment already verified", ledger.getInternalOrderId(), "PAID");
            }

            ledger.setRazorpayPaymentId(request.razorpayPaymentId());
            ledger.setStatus(PaymentStatus.PAID);
            
            try {
                ledgerRepository.saveAndFlush(ledger);
                // Trigger Async Email Notification
                emailNotificationService.sendPaymentReceiptEmail(ledger);
            } catch (DataIntegrityViolationException ex) {
                // Another thread might have processed this razorpayPaymentId (Unique Constraint)
                log.warn("Concurrent payment update detected for: {}", request.razorpayPaymentId());
            }

            return new PaymentVerificationResponse(true, "Payment verified successfully", ledger.getInternalOrderId(), "PAID");

        } catch (RazorpayException e) {
            log.error("Razorpay exception during verification", e);
            return new PaymentVerificationResponse(false, "Gateway verification failed: " + e.getMessage(), null, "FAILED");
        }
    }

    @Transactional
    public void handleWebhook(String payload, String signature) {
        try {
            // Verify Webhook Signature using specific Webhook Secret
            boolean isValid = Utils.verifyWebhookSignature(payload, signature, webhookSecret);
            if (!isValid) {
                log.error("Invalid webhook signature");
                return;
            }

            JSONObject event = new JSONObject(payload);
            String eventType = event.getString("event");

            if ("payment.captured".equals(eventType) || "order.paid".equals(eventType)) {
                JSONObject paymentEntity = event.getJSONObject("payload").getJSONObject("payment").getJSONObject("entity");
                String razorpayOrderId = paymentEntity.getString("order_id");
                String razorpayPaymentId = paymentEntity.getString("id");
                
                Optional<PaymentLedger> ledgerOpt = ledgerRepository.findByRazorpayOrderId(razorpayOrderId);
                if (ledgerOpt.isPresent()) {
                    PaymentLedger ledger = ledgerOpt.get();
                    if (ledger.getStatus() != PaymentStatus.PAID) {
                        ledger.setRazorpayPaymentId(razorpayPaymentId);
                        ledger.setStatus(PaymentStatus.PAID);
                        
                        try {
                            ledgerRepository.saveAndFlush(ledger);
                            log.info("Webhook successfully processed and marked PAID for order: {}", razorpayOrderId);
                            // Trigger Async Email Notification
                            emailNotificationService.sendPaymentReceiptEmail(ledger);
                        } catch (DataIntegrityViolationException ex) {
                            log.warn("Concurrent webhook payment update detected for: {}", razorpayPaymentId);
                        }
                    }
                }
            } else if ("payment.failed".equals(eventType)) {
                JSONObject paymentEntity = event.getJSONObject("payload").getJSONObject("payment").getJSONObject("entity");
                String razorpayOrderId = paymentEntity.getString("order_id");
                
                Optional<PaymentLedger> ledgerOpt = ledgerRepository.findByRazorpayOrderId(razorpayOrderId);
                if (ledgerOpt.isPresent()) {
                    PaymentLedger ledger = ledgerOpt.get();
                    if (ledger.getStatus() == PaymentStatus.PENDING) {
                        ledger.setStatus(PaymentStatus.FAILED);
                        ledgerRepository.save(ledger);
                        log.info("Webhook successfully processed and marked FAILED for order: {}", razorpayOrderId);
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error processing webhook", e);
        }
    }

    public Optional<PaymentLedger> getPaymentByInternalOrderId(String internalOrderId) {
        return ledgerRepository.findByInternalOrderId(internalOrderId);
    }


}
