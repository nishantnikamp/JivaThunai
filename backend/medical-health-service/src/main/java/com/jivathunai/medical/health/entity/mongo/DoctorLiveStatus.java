package com.jivathunai.medical.health.entity.mongo;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Doctor Live Operational Status Entity
 * Implements real-time presence, operational availability (distinguishing schedule from live status).
 */
@Document(collection = "doctor_live_statuses")
@CompoundIndexes({
    @CompoundIndex(name = "doc_status_hosp_idx", def = "{'hospitalId': 1, 'operationalStatus': 1}")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorLiveStatus {

    @Id
    private String id;

    @Indexed(unique = true)
    private UUID doctorId;

    private String doctorName;
    private String specialization;
    private String vciRegistrationNumber;

    private UUID hospitalId;
    private String hospitalName;
    private String branchName;

    @Builder.Default
    private OperationalStatus operationalStatus = OperationalStatus.AVAILABLE;

    private String currentLocation; // e.g., "Consultation Room 3", "Operating Theatre 1", "Emergency Ward"
    private String currentEncounterInfo; // Active patient name or procedure
    private UUID currentProcedureId;

    @Builder.Default
    private Boolean onCall = false;

    private LocalDateTime expectedAvailableAt;

    @Builder.Default
    private LocalDateTime lastHeartbeatAt = LocalDateTime.now();

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public enum OperationalStatus {
        AVAILABLE,
        CONSULTING,
        IN_SURGERY,
        HANDLING_EMERGENCY,
        ON_BREAK,
        OFF_DUTY,
        ON_CALL,
        UNAVAILABLE,
        UNKNOWN
    }
}
