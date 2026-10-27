package com.jivathunai.payment.controller;

import com.jivathunai.payment.dto.PaymentOrderRequest;
import com.jivathunai.payment.dto.PaymentOrderResponse;
import com.jivathunai.payment.dto.PaymentVerificationRequest;
import com.jivathunai.payment.dto.PaymentVerificationResponse;
import com.jivathunai.payment.enums.PaymentStatus;

import com.jivathunai.payment.service.PaymentService;
import com.jivathunai.payment.service.ReceiptGeneratorService;
import com.razorpay.RazorpayException;

import lombok.RequiredArgsConstructor;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(@RequestBody PaymentOrderRequest request) {
        try {
            PaymentOrderResponse response = paymentService.createOrder(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RazorpayException e) {
            log.error("Failed to create Razorpay order", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to initiate payment: " + e.getMessage());
        }
    }

    @PostMapping("/verify-callback")
    public ResponseEntity<PaymentVerificationResponse> verifyCallback(@RequestBody PaymentVerificationRequest request) {
        PaymentVerificationResponse response = paymentService.verifyCallback(request);
        if (response.success()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }



    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(
            @RequestBody String payload,
            @RequestHeader("X-Razorpay-Signature") String signature) {
        
        paymentService.handleWebhook(payload, signature);
        // Always return 200 OK to acknowledge receipt of webhook
        return ResponseEntity.ok("Webhook received");
    }

    @GetMapping("/{internalOrderId}/receipt")
    public ResponseEntity<?> downloadReceipt(@PathVariable("internalOrderId") String internalOrderId) {
        try {
            var paymentOpt = paymentService.getPaymentByInternalOrderId(internalOrderId);
            if (paymentOpt.isEmpty() || paymentOpt.get().getStatus() != PaymentStatus.PAID) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
            }

            ReceiptGeneratorService receiptGenerator = new ReceiptGeneratorService();
            byte[] pdfBytes = receiptGenerator.generateReceiptPdf(paymentOpt.get());

            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.setContentType(org.springframework.http.MediaType.APPLICATION_PDF);
            headers.add("Content-Disposition", "inline; filename=\"Receipt_" + internalOrderId + ".pdf\"");
            headers.add("Cache-Control", "no-cache, no-store, must-revalidate");
            headers.add("Pragma", "no-cache");
            headers.add("Expires", "0");

            return ResponseEntity.ok().headers(headers).body(pdfBytes);
        } catch (Exception e) {
            log.error("Failed to generate receipt", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error generating receipt: " + e.getMessage() + (e.getCause() != null ? " - Cause: " + e.getCause().getMessage() : ""));
        }
    }
}
