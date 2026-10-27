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
 * Operation Theatre (OT) Surgical Procedure Entity
 * Manages surgery scheduling, clinical team assignment, actual start/end, and theatre occupancy.
 */
@Document(collection = "ot_procedures")
@CompoundIndexes({
    @CompoundIndex(name = "ot_hosp_status_idx", def = "{'hospitalId': 1, 'status': 1}"),
    @CompoundIndex(name = "ot_surgeon_idx", def = "{'leadSurgeonId': 1}")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OTProcedure {

    @Id
    private String id;

    @Indexed(unique = true)
    @Builder.Default
    private UUID procedureId = UUID.randomUUID();

    private UUID hospitalId;
    private String hospitalName;

    @Indexed
    private UUID resourceId; // The Operation Theatre resource ID
    private String resourceCode;
    private String theatreName;

    private String procedureName; // e.g. "Emergency Splenectomy", "Cruciate Ligament Repair"
    
    private UUID patientId;
    private String patientName;
    private String species;
    private String ownerName;

    private UUID leadSurgeonId;
    private String leadSurgeonName;
    private String anesthetistName;
    private String assistantSurgeonName;
    private String scrubNurseName;

    private LocalDateTime scheduledStart;
    private LocalDateTime scheduledEnd;

    private LocalDateTime actualStart;
    private LocalDateTime actualEnd;

    @Builder.Default
    private ProcedurePriority priority = ProcedurePriority.ROUTINE;

    @Builder.Default
    private ProcedureStatus status = ProcedureStatus.SCHEDULED;

    private String clinicalNotes;
    private String postOpRecoveryPlan;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public enum ProcedurePriority {
        ROUTINE, URGENT, EMERGENCY
    }

    public enum ProcedureStatus {
        SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED
    }
}
