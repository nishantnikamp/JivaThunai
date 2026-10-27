package com.jivathunai.marketplace.dto;
import java.util.List;
public record CheckoutRequest(Long buyerId, List<CartItem> items, String prescriptionUrl) {}
