package com.jivathunai.medical.health.dto;

import com.jivathunai.medical.health.entity.mongo.PetMedicalRecord;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LogVaccineRequest {

    @NotBlank(message = "Vaccine name is required")
    private String vaccineName;

    private LocalDate administeredDate;

    @NotNull(message = "Next due date is required")
    private LocalDate nextDueDate;

    @Builder.Default
    private PetMedicalRecord.VaccinationStatus status = PetMedicalRecord.VaccinationStatus.ADMINISTERED;

    private UUID administeredByDoctorId;
    private String doctorName;
    private String batchNumber;
    private String manufacturer;
    private String secureS3CertificateKey;
}
