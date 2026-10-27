package com.jivathunai.medical.health.entity.mongo;

import lombok.*;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Document(collection = "pet_medical_records")
@CompoundIndexes({
    @CompoundIndex(name = "vax_nextDueDate_status_idx", def = "{'vaccinationSchedule.nextDueDate': 1, 'vaccinationSchedule.status': 1}"),
    @CompoundIndex(name = "pet_owner_idx", def = "{'petId': 1, 'ownerId': 1}")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PetMedicalRecord {

    @Id
    private String id;

    @Indexed(unique = true)
    private UUID petId;

    private String petName;
    private String species;
    private String breed;

    @Indexed
    private UUID ownerId;

    private String ownerName;
    private String ownerPhone;
    private String ownerEmail;

    private String bloodGroup;

    @Builder.Default
    private Boolean isSterilized = false;

    private MicrochipInfo microchipDetails;

    @Builder.Default
    private List<AllergyItem> allergies = new ArrayList<>();

    @Builder.Default
    private List<VitalSignEntry> vitalSignsHistory = new ArrayList<>();

    @Builder.Default
    private List<VaccinationEntry> vaccinationSchedule = new ArrayList<>();

    @Builder.Default
    private List<ClinicalEPrescription> clinicalEPrescriptions = new ArrayList<>();

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MicrochipInfo {
        private String chipNumber;
        private String chipManufacturer;
        private LocalDate implantationDate;
        private String verifiedByDoctorName;
        private String rfidFrequency;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AllergyItem {
        @Builder.Default
        private UUID allergyId = UUID.randomUUID();
        private String allergen;
        private AllergySeverity severity;
        private String reaction;
        @Builder.Default
        private boolean active = true;
    }

    public enum AllergySeverity {
        MILD, MODERATE, SEVERE, LIFE_THREATENING
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class VitalSignEntry {
        private LocalDateTime recordedAt;
        private Double weightKg;
        private Double temperatureCelsius;
        private Integer heartRateBpm;
        private Integer respirationRateBpm;
        private UUID recordedByDoctorId;
        private String doctorName;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class VaccinationEntry {
        @Builder.Default
        private UUID vaccineId = UUID.randomUUID();
        private String vaccineName;
        private LocalDate administeredDate;
        private LocalDate nextDueDate;
        private VaccinationStatus status;
        private UUID administeredByDoctorId;
        private String doctorName;
        private String batchNumber;
        private String manufacturer;
        private String secureS3CertificateKey;
        private String certificateUrl;
        private String uploadedByRole;
        private LocalDateTime certificateUploadedAt;
    }

    public enum VaccinationStatus {
        SCHEDULED, ADMINISTERED, OVERDUE
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ClinicalEPrescription {
        @Builder.Default
        private UUID prescriptionId = UUID.randomUUID();
        private LocalDateTime visitDate;
        private UUID doctorId;
        private String doctorName;
        private String vciRegistrationNumber;
        private String clinicName;
        private String diagnosedIllness;
        private String clinicalObservations;
        private String treatmentPlan;
        
        @Builder.Default
        private List<MedicineItem> medicines = new ArrayList<>();

        @Builder.Default
        private List<DiagnosticMediaItem> diagnosticMedia = new ArrayList<>();

        private String doctorDigitalSignature;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MedicineItem {
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
    public static class DiagnosticMediaItem {
        @Builder.Default
        private UUID mediaId = UUID.randomUUID();
        private MediaType mediaType;
        private String title;
        private String secureS3Key;
        private String fileUrl;
        @Builder.Default
        private LocalDateTime uploadedAt = LocalDateTime.now();
    }

    public enum MediaType {
        PHOTO, VIDEO, DOCUMENT
    }
}
