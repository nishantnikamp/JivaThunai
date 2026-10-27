package com.jivathunai.payment.dto;

import java.math.BigDecimal;

public record PaymentOrderResponse(
        String razorpayOrderId,
        String internalReferenceId,
        BigDecimal amount,
        String currency,
        String status
) {}
