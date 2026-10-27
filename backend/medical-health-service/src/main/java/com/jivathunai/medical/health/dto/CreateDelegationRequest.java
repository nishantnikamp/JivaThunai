package com.jivathunai.medical.health.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateDelegationRequest {

    @NotNull(message = "Pet ID is required")
    private UUID petId;

    private String petName;
    private String species;
    private String breed;

    @NotNull(message = "Owner User ID is required")
    private UUID ownerUserId;

    private String ownerName;
    private String ownerPhone;

    private UUID caretakerUserId;

    @NotBlank(message = "Caretaker Email is required")
    @Email(message = "Invalid caretaker email")
    private String caretakerEmail;

    private String caretakerName;

    @NotNull(message = "Start time is required")
    private LocalDateTime startsAt;

    @NotNull(message = "Expiry time is required")
    private LocalDateTime expiresAt;

    @Builder.Default
    private List<String> allowedPermissions = new ArrayList<>();

    private String notes;
    private String emergencyVetContact;
    private String feedingSchedule;
}
