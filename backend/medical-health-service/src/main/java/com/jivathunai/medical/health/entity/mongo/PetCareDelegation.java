package com.jivathunai.medical.health.entity.mongo;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Temporary Pet Care Access Entity
 * Implements Innovation 3: Time-limited, least-privilege delegation of pet care to trusted caretakers.
 */
@Document(collection = "pet_care_delegations")
@CompoundIndexes({
    @CompoundIndex(name = "delegation_owner_idx", def = "{'ownerUserId': 1, 'delegationStatus': 1}"),
    @CompoundIndex(name = "delegation_caretaker_idx", def = "{'caretakerUserId': 1, 'delegationStatus': 1}"),
    @CompoundIndex(name = "delegation_pet_idx", def = "{'petId': 1}")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PetCareDelegation {

    @Id
    private String id;

    @Indexed(unique = true)
    @Builder.Default
    private UUID delegationId = UUID.randomUUID();

    private UUID petId;
    private String petName;
    private String species;
    private String breed;

    private UUID ownerUserId;
    private String ownerName;
    private String ownerPhone;

    private UUID caretakerUserId;
    private String caretakerEmail;
    private String caretakerName;

    private String invitationToken;
    private LocalDateTime startsAt;
    private LocalDateTime expiresAt;

    @Builder.Default
    private DelegationStatus delegationStatus = DelegationStatus.ACTIVE;

    @Builder.Default
    private List<String> allowedPermissions = new ArrayList<>();
    // Example permissions:
    // "VIEW_FEEDING", "VIEW_ALLERGIES", "VIEW_MEDICATIONS",
    // "VIEW_EMERGENCY_CONTACTS", "VIEW_CARE_TASKS", "RECORD_TASK_COMPLETION"

    private String notes;
    private String emergencyVetContact;
    private String feedingSchedule;

    @Builder.Default
    private List<DelegationActivityEntry> activityLog = new ArrayList<>();

    private LocalDateTime revokedAt;
    private String revocationReason;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public enum DelegationStatus {
        ACTIVE, INVITED, EXPIRED, REVOKED
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DelegationActivityEntry {
        @Builder.Default
        private LocalDateTime timestamp = LocalDateTime.now();
        private UUID actorUserId;
        private String actorRole;
        private String action;
        private String details;
    }
}
