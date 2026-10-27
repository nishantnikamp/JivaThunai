package com.jivathunai.payment.dto;

public record PaymentVerificationResponse(
        boolean success,
        String message,
        String internalReferenceId,
        String status
) {}
