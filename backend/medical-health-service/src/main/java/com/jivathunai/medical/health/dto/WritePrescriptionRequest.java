package com.jivathunai.medical.health.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WritePrescriptionRequest {

    private UUID doctorId;
    private String doctorName;
    private String vciRegistrationNumber;
    private String clinicName;

    @NotBlank(message = "Diagnosed illness is required")
    private String diagnosedIllness;

    private String clinicalObservations;
    private String treatmentPlan;

    @NotEmpty(message = "At least one medicine must be prescribed")
    @Builder.Default
    private List<MedicineDto> medicines = new ArrayList<>();

    @Builder.Default
    private List<DiagnosticMediaDto> diagnosticMedia = new ArrayList<>();

    private String doctorDigitalSignature;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MedicineDto {
        @NotBlank(message = "Medicine name is required")
        private String medicineName;
        private String dosage;
        private String frequency;
        private Integer durationDays;
        private String instructions;
        @Builder.Default
        private List<String> activeIngredients = new ArrayList<>();
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DiagnosticMediaDto {
        private String mediaType; // PHOTO, VIDEO, DOCUMENT
        private String title;
        private String secureS3Key;
        private String fileUrl;
    }
}
