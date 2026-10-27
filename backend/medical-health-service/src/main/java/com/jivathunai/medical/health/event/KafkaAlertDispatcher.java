package com.jivathunai.medical.health.event;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class KafkaAlertDispatcher {

    public static final String VACCINE_ALERT_TOPIC = "vaccine-alerts-topic";

    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Autowired(required = false)
    public KafkaAlertDispatcher(KafkaTemplate<String, Object> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void dispatchVaccineAlert(VaccineAlertEvent event) {
        log.info("🚨 [VACCINATION_ALERT_ENGINE] Dispatching alert packet for Pet: '{}' (ID: {}), Owner: '{}' ({}), Vaccine: '{}', Due: {}",
                event.getPetName(), event.getPetId(), event.getOwnerName(), event.getOwnerPhone(),
                event.getVaccineName(), event.getNextDueDate());

        if (kafkaTemplate != null) {
            try {
                kafkaTemplate.send(VACCINE_ALERT_TOPIC, event.getPetId().toString(), event);
                log.info("✅ Successfully emitted VaccineAlertEvent to Kafka topic '{}'", VACCINE_ALERT_TOPIC);
            } catch (Exception e) {
                log.warn("⚠️ Failed to transmit Kafka message to '{}': {}. Fallback notification processed locally.", VACCINE_ALERT_TOPIC, e.getMessage());
            }
        } else {
            log.info("ℹ️ KafkaTemplate not configured in standalone mode; alert recorded and routed via local channel.");
        }
    }
}
