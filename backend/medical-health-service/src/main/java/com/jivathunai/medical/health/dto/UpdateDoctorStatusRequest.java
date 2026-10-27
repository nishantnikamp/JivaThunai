package com.jivathunai.medical.health.dto;

import com.jivathunai.medical.health.entity.mongo.DoctorLiveStatus;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateDoctorStatusRequest {

    @NotNull(message = "Operational status is required")
    private DoctorLiveStatus.OperationalStatus operationalStatus;

    private String currentLocation;
    private String currentEncounterInfo;
    private Boolean onCall;
    private LocalDateTime expectedAvailableAt;
}
