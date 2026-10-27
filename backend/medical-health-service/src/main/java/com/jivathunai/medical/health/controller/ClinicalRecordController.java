package com.jivathunai.medical.health.controller;

import com.jivathunai.common.response.ApiResponse;
import com.jivathunai.medical.health.dto.AddAllergyRequest;
import com.jivathunai.medical.health.dto.AddVitalSignRequest;
import com.jivathunai.medical.health.dto.LogVaccineRequest;
import com.jivathunai.medical.health.dto.WritePrescriptionRequest;
import com.jivathunai.medical.health.entity.mongo.PetMedicalRecord;
import com.jivathunai.medical.health.service.ClinicalMedicalRecordService;
import com.jivathunai.medical.health.service.VaccinationAlertCronService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/medical")
@RequiredArgsConstructor
@Slf4j
public class ClinicalRecordController {

    private final ClinicalMedicalRecordService medicalService;
    private final VaccinationAlertCronService cronService;

    private UUID toUuid(String val) {
        if (val == null || val.trim().isEmpty()) return UUID.randomUUID();
        try {
            return UUID.fromString(val.trim());
        } catch (IllegalArgumentException e) {
            return UUID.nameUUIDFromBytes(val.trim().getBytes(java.nio.charset.StandardCharsets.UTF_8));
        }
    }

    @GetMapping("/pets/{petId}")
    public ResponseEntity<ApiResponse<PetMedicalRecord>> getPetMedicalRecord(
            @PathVariable String petId,
            @RequestParam(value = "petName", required = false) String petName,
            @RequestParam(value = "ownerId", required = false) String ownerId) {

        UUID petUuid = toUuid(petId);
        UUID ownerUuid = ownerId != null ? toUuid(ownerId) : null;
        PetMedicalRecord record = medicalService.getOrCreateMedicalRecord(petUuid, petName, ownerUuid);
        return ResponseEntity.ok(ApiResponse.success("Medical record retrieved successfully", record));
    }

    @PostMapping("/pets/{petId}/prescriptions")
    public ResponseEntity<ApiResponse<PetMedicalRecord>> writePrescription(
            @PathVariable String petId,
            @Valid @RequestBody WritePrescriptionRequest request) {

        UUID petUuid = toUuid(petId);
        log.info("🩺 Doctor writing prescription for Pet ID: {}", petUuid);
        PetMedicalRecord updated = medicalService.writePrescriptionWithAllergenCheck(petUuid, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Digital E-Prescription recorded and signed successfully", updated));
    }

    @PutMapping("/pets/{petId}/prescriptions/{prescriptionId}")
    public ResponseEntity<ApiResponse<PetMedicalRecord>> editPrescription(
            @PathVariable String petId,
            @PathVariable String prescriptionId,
            @Valid @RequestBody WritePrescriptionRequest request) {

        UUID petUuid = toUuid(petId);
        log.info("✏️ Doctor editing prescription {} for Pet ID: {}", prescriptionId, petUuid);
        PetMedicalRecord updated = medicalService.editPrescription(petUuid, prescriptionId, request);
        return ResponseEntity.ok(ApiResponse.success("Digital E-Prescription amended successfully", updated));
    }

    @DeleteMapping("/pets/{petId}/prescriptions/{prescriptionId}")
    public ResponseEntity<ApiResponse<PetMedicalRecord>> deletePrescription(
            @PathVariable String petId,
            @PathVariable String prescriptionId) {

        UUID petUuid = toUuid(petId);
        log.info("🗑️ Doctor deleting prescription {} for Pet ID: {}", prescriptionId, petUuid);
        PetMedicalRecord updated = medicalService.deletePrescription(petUuid, prescriptionId);
        return ResponseEntity.ok(ApiResponse.success("Digital E-Prescription deleted", updated));
    }

    @PostMapping("/pets/{petId}/vaccinations")
    public ResponseEntity<ApiResponse<PetMedicalRecord>> logVaccination(
            @PathVariable String petId,
            @Valid @RequestBody LogVaccineRequest request) {

        UUID petUuid = toUuid(petId);
        PetMedicalRecord updated = medicalService.logVaccination(petUuid, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Vaccination log recorded successfully", updated));
    }

    @PutMapping("/pets/{petId}/vaccinations/{vaccineId}")
    public ResponseEntity<ApiResponse<PetMedicalRecord>> editVaccination(
            @PathVariable String petId,
            @PathVariable String vaccineId,
            @Valid @RequestBody LogVaccineRequest request) {

        UUID petUuid = toUuid(petId);
        PetMedicalRecord updated = medicalService.editVaccination(petUuid, vaccineId, request);
        return ResponseEntity.ok(ApiResponse.success("Vaccine record updated successfully", updated));
    }

    @DeleteMapping("/pets/{petId}/vaccinations/{vaccineId}")
    public ResponseEntity<ApiResponse<PetMedicalRecord>> deleteVaccination(
            @PathVariable String petId,
            @PathVariable String vaccineId) {

        UUID petUuid = toUuid(petId);
        PetMedicalRecord updated = medicalService.deleteVaccination(petUuid, vaccineId);
        return ResponseEntity.ok(ApiResponse.success("Vaccine record deleted", updated));
    }

    @PostMapping("/pets/{petId}/vaccinations/{vaccineId}/certificate")
    public ResponseEntity<ApiResponse<PetMedicalRecord>> uploadVaccineCertificate(
            @PathVariable String petId,
            @PathVariable String vaccineId,
            @RequestBody java.util.Map<String, String> payload) {

        UUID petUuid = toUuid(petId);
        String certUrl = payload.get("certificateUrl");
        String s3Key = payload.get("secureS3CertificateKey");
        String role = payload.getOrDefault("uploadedByRole", "ROLE_PET_OWNER");
        PetMedicalRecord updated = medicalService.uploadVaccineCertificate(petUuid, vaccineId, certUrl, s3Key, role);
        return ResponseEntity.ok(ApiResponse.success("Vaccine certificate proof uploaded successfully", updated));
    }

    @PostMapping("/pets/{petId}/allergies")
    public ResponseEntity<ApiResponse<PetMedicalRecord>> addAllergy(
            @PathVariable String petId,
            @Valid @RequestBody AddAllergyRequest request) {

        UUID petUuid = toUuid(petId);
        PetMedicalRecord updated = medicalService.addAllergy(petUuid, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Allergy record updated successfully", updated));
    }

    @PutMapping("/pets/{petId}/allergies/{allergyId}")
    public ResponseEntity<ApiResponse<PetMedicalRecord>> editAllergy(
            @PathVariable String petId,
            @PathVariable String allergyId,
            @Valid @RequestBody AddAllergyRequest request) {

        UUID petUuid = toUuid(petId);
        PetMedicalRecord updated = medicalService.editAllergy(petUuid, allergyId, request);
        return ResponseEntity.ok(ApiResponse.success("Allergy record updated successfully", updated));
    }

    @DeleteMapping("/pets/{petId}/allergies/{allergyId}")
    public ResponseEntity<ApiResponse<PetMedicalRecord>> deleteAllergy(
            @PathVariable String petId,
            @PathVariable String allergyId) {

        UUID petUuid = toUuid(petId);
        PetMedicalRecord updated = medicalService.deleteAllergy(petUuid, allergyId);
        return ResponseEntity.ok(ApiResponse.success("Allergy record deleted", updated));
    }

    @PostMapping("/pets/{petId}/vitals")
    public ResponseEntity<ApiResponse<PetMedicalRecord>> addVitalSign(
            @PathVariable String petId,
            @Valid @RequestBody AddVitalSignRequest request) {

        UUID petUuid = toUuid(petId);
        PetMedicalRecord updated = medicalService.addVitalSign(petUuid, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Vital signs recorded successfully", updated));
    }

    @GetMapping("/owner/{ownerId}/pets")
    public ResponseEntity<ApiResponse<List<PetMedicalRecord>>> getOwnerPetRecords(@PathVariable String ownerId) {
        UUID ownerUuid = toUuid(ownerId);
        List<PetMedicalRecord> records = medicalService.getRecordsByOwner(ownerUuid);
        return ResponseEntity.ok(ApiResponse.success(records));
    }

    @GetMapping("/patients")
    public ResponseEntity<ApiResponse<List<PetMedicalRecord>>> getAllPatients() {
        List<PetMedicalRecord> patients = medicalService.getAllPatients();
        return ResponseEntity.ok(ApiResponse.success("Patient directory retrieved successfully", patients));
    }

    @GetMapping("/prescriptions")
    public ResponseEntity<ApiResponse<List<PetMedicalRecord.ClinicalEPrescription>>> getAllPrescriptions() {
        List<PetMedicalRecord.ClinicalEPrescription> prescriptions = medicalService.getAllPrescriptions();
        return ResponseEntity.ok(ApiResponse.success("Digital prescriptions archive retrieved", prescriptions));
    }

    @PatchMapping("/pets/{petId}/sterilization")
    public ResponseEntity<ApiResponse<PetMedicalRecord>> updateSterilization(
            @PathVariable String petId,
            @RequestParam boolean isSterilized) {
        UUID petUuid = toUuid(petId);
        PetMedicalRecord updated = medicalService.updateSterilizationStatus(petUuid, isSterilized);
        return ResponseEntity.ok(ApiResponse.success("Sterilization status updated", updated));
    }

    @PatchMapping("/pets/{petId}/microchip")
    public ResponseEntity<ApiResponse<PetMedicalRecord>> updateMicrochip(
            @PathVariable String petId,
            @RequestBody PetMedicalRecord.MicrochipInfo microchipInfo) {
        UUID petUuid = toUuid(petId);
        PetMedicalRecord updated = medicalService.updateMicrochipInfo(petUuid, microchipInfo);
        return ResponseEntity.ok(ApiResponse.success("Microchip info updated", updated));
    }

    @PatchMapping("/pets/{petId}/blood-group")
    public ResponseEntity<ApiResponse<PetMedicalRecord>> updateBloodGroup(
            @PathVariable String petId,
            @RequestParam String bloodGroup) {
        UUID petUuid = toUuid(petId);
        PetMedicalRecord updated = medicalService.updateBloodGroup(petUuid, bloodGroup);
        return ResponseEntity.ok(ApiResponse.success("Blood group updated", updated));
    }

    @PostMapping("/cron/trigger-vaccine-alerts")
    public ResponseEntity<ApiResponse<String>> triggerVaccineAlertCron() {
        int count = cronService.triggerManualScan();
        return ResponseEntity.ok(ApiResponse.success("Vaccination reminder cron executed manually. Dispatched " + count + " vaccine alert events.", "EXECUTED"));
    }
}
