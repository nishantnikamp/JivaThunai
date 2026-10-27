package com.jivathunai.medical.health.dto;

import com.jivathunai.medical.health.entity.mongo.HospitalResource;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateResourceStatusRequest {

    @NotNull(message = "Operational status is required")
    private HospitalResource.ResourceStatus operationalStatus;

    private UUID currentPatientId;
    private String currentPatientName;
    private String currentOwnerName;
    private String currentOwnerPhone;
    private UUID assignedDoctorId;
    private String assignedDoctorName;
    private String activeProcedureType;
    private String triagePriority;

    private LocalDateTime expectedReleaseAt;
    private Boolean cleaningChecklistCompleted;
    private String statusNotes;
}
