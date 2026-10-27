package com.jivathunai.medical.health.event;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VaccineAlertEvent {

    private UUID alertId;
    private UUID petId;
    private String petName;
    private UUID ownerId;
    private String ownerName;
    private String ownerPhone;
    private String ownerEmail;
    private UUID vaccineId;
    private String vaccineName;
    private LocalDate nextDueDate;
    private String status;
    private Long daysRemaining;
    private String doctorRecommendations;
    private String clinicName;
    @Builder.Default
    private LocalDateTime emittedAt = LocalDateTime.now();
}
