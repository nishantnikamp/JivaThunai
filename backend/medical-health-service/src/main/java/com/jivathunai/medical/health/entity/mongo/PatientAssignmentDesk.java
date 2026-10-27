package com.jivathunai.medical.health.entity.mongo;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Document(collection = "veterinary_patient_assignments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientAssignmentDesk {

    @Id
    private UUID assignmentId;

    private UUID doctorId; // Reference to ROLE_VET_DOCTOR
    private String doctorName;

    private List<UUID> petIds; // Reference to central Digital Pet Passport IDs

    private UUID parentOrganizationId; // Tracking hospital ownership
    private String hospitalName;

    private CaseStatus caseStatus;

    private List<ClinicalSummary> clinicalPrescriptionTimelines;

    public enum CaseStatus {
        ACTIVE_TREATMENT, MONITORING, DISCHARGED
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ClinicalSummary {
        private UUID petId;
        private String petName;
        private String species;
        private String breed;
        private String ownerName;
        private String ownerPhone;
        private String bloodGroup;
        private List<String> activePrescriptions;
        private List<String> diagnosticReports; // URLs or references
        private List<VaccinationSchedule> automatedVaccinationSchedules;
        private List<String> allergies;
        private Double lastWeightKg;
        private Double lastTemperatureCelsius;
        private Integer lastHeartRateBpm;
        private Integer lastRespirationRateBpm;
        private CaseStatus caseStatus;
        private LocalDateTime lastUpdated;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class VaccinationSchedule {
        private String vaccineName;
        private LocalDateTime scheduledDate;
        private boolean administered;
    }
}
