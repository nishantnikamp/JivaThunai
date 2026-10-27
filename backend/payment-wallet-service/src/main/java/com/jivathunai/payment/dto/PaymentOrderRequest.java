package com.jivathunai.payment.dto;

import java.math.BigDecimal;

public record PaymentOrderRequest(
        BigDecimal amount,
        String currency,
        String internalReferenceId,
        String customerName,
        String customerEmail
) {}

