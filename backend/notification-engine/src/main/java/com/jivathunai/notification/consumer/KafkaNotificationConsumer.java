package com.jivathunai.notification.consumer;

import com.jivathunai.notification.service.EmailNotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class KafkaNotificationConsumer {

    private final EmailNotificationService emailNotificationService;

    @KafkaListener(topics = "user-registration-events", groupId = "notification-group")
    public void consumeRegistrationEvent(String message) {
        log.info("Received Kafka User Registration Event: {}", message);
        // Process Kafka payload and dispatch email notification
        Map<String, Object> model = new HashMap<>();
        model.put("recipientName", "Pet Lover");
        model.put("otpCode", "849201");
        emailNotificationService.sendHtmlEmail("user@example.com", "Welcome to Jiva Thunai - OTP Verification", "welcome_verification", model);
    }
}
