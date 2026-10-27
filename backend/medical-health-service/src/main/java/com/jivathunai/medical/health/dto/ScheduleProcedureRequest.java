package com.jivathunai.medical.health.dto;

import com.jivathunai.medical.health.entity.mongo.OTProcedure;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScheduleProcedureRequest {

    @NotNull(message = "Hospital ID is required")
    private UUID hospitalId;
    private String hospitalName;

    @NotNull(message = "OT Resource ID is required")
    private UUID resourceId;
    private String theatreName;

    @NotBlank(message = "Procedure name is required")
    private String procedureName;

    @NotNull(message = "Patient ID is required")
    private UUID patientId;
    private String patientName;
    private String species;
    private String ownerName;

    @NotNull(message = "Lead surgeon ID is required")
    private UUID leadSurgeonId;
    private String leadSurgeonName;
    private String anesthetistName;
    private String assistantSurgeonName;
    private String scrubNurseName;

    @NotNull(message = "Scheduled start time is required")
    private LocalDateTime scheduledStart;

    @NotNull(message = "Scheduled end time is required")
    private LocalDateTime scheduledEnd;

    @Builder.Default
    private OTProcedure.ProcedurePriority priority = OTProcedure.ProcedurePriority.ROUTINE;

    private String clinicalNotes;
    private String postOpRecoveryPlan;
}
