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
import java.util.UUID;

/**
 * Hospital Physical Resource Entity
 * Tracks Emergency Ward Beds, ICU Beds, Operation Theatres (OT), and Consultation Rooms.
 */
@Document(collection = "hospital_resources")
@CompoundIndexes({
    @CompoundIndex(name = "res_hosp_type_status_idx", def = "{'hospitalId': 1, 'resourceType': 1, 'operationalStatus': 1}"),
    @CompoundIndex(name = "res_code_idx", def = "{'hospitalId': 1, 'resourceCode': 1}", unique = true)
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HospitalResource {

    @Id
    private String id;

    @Indexed(unique = true)
    @Builder.Default
    private UUID resourceId = UUID.randomUUID();

    private UUID hospitalId;
    private String hospitalName;
    private String branchName;

    private String resourceCode; // e.g. "EW-BED-01", "ICU-BED-02", "OT-ROOM-01"
    private String resourceName; // e.g. "Emergency Trauma Bed 1", "Critical Care ICU 2", "Major Surgery OT 1"

    private ResourceType resourceType;

    @Builder.Default
    private ResourceStatus operationalStatus = ResourceStatus.AVAILABLE;

    private String locationDescription; // e.g. "Ground Floor Trauma Wing", "2nd Floor Critical Care"

    // Current occupancy details
    private UUID currentPatientId;
    private String currentPatientName;
    private String currentOwnerName;
    private String currentOwnerPhone;
    private UUID assignedDoctorId;
    private String assignedDoctorName;
    private String activeProcedureType;
    private String triagePriority;

    private LocalDateTime occupiedSince;
    private LocalDateTime expectedReleaseAt;

    @Builder.Default
    private Boolean cleaningChecklistCompleted = true;

    private String statusNotes;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public enum ResourceType {
        EMERGENCY_BED, ICU_BED, OPERATION_THEATRE, CONSULTATION_ROOM, RECOVERY_ROOM
    }

    public enum ResourceStatus {
        AVAILABLE, RESERVED, OCCUPIED, CLEANING, MAINTENANCE, OUT_OF_SERVICE, UNKNOWN
    }

    public enum TriagePriority {
        ROUTINE, URGENT, EMERGENCY, CRITICAL
    }
}
