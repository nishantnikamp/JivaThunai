package com.jivathunai.medical.health.controller;

import com.jivathunai.common.response.ApiResponse;
import com.jivathunai.medical.health.dto.AssignPatientRequest;
import com.jivathunai.medical.health.entity.mongo.PatientAssignmentDesk;
import com.jivathunai.medical.health.service.VetDoctorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/vet/doctor")
@RequiredArgsConstructor
@Slf4j
public class VetDoctorController {

    private final VetDoctorService doctorService;

    /**
     * Secure Patient Assignment System
     * Allows doctors or hospital administrators to link up to 'N' active pets to a doctor.
     */
    @PostMapping("/assign-patient")
    public ResponseEntity<ApiResponse<PatientAssignmentDesk>> assignPatient(@Valid @RequestBody AssignPatientRequest request) {
        log.info("🩺 Doctor patient assignment requested for Doctor: {}", request.doctorId());
        PatientAssignmentDesk assignment = doctorService.assignPatients(request);
        return ResponseEntity.ok(ApiResponse.success("Patients assigned successfully to Doctor desk", assignment));
    }

    /**
     * Get My Patients
     * Returns clinical summaries, allergies, active prescriptions, and vaccination schedules for doctor's assigned patients.
     */
    @GetMapping("/my-patients")
    public ResponseEntity<ApiResponse<List<PatientAssignmentDesk.ClinicalSummary>>> getMyPatients(
            @RequestParam UUID doctorId,
            @RequestParam(required = false, defaultValue = "ALL") String statusFilter) {

        List<PatientAssignmentDesk.ClinicalSummary> summaries = doctorService.getDoctorPatientSummaries(doctorId, statusFilter);
        return ResponseEntity.ok(ApiResponse.success("Assigned patient roster retrieved successfully", summaries));
    }

    /**
     * Get Clinical Snapshot for a Particular Pet
     */
    @GetMapping("/patients/{petId}/summary")
    public ResponseEntity<ApiResponse<PatientAssignmentDesk.ClinicalSummary>> getPatientSummary(@PathVariable UUID petId) {
        PatientAssignmentDesk.ClinicalSummary summary = doctorService.getPatientClinicalSnapshot(petId);
        return ResponseEntity.ok(ApiResponse.success("Pet clinical snapshot retrieved", summary));
    }

    /**
     * Update Case Status of an assigned patient (ACTIVE_TREATMENT, MONITORING, DISCHARGED)
     */
    @PatchMapping("/patients/{petId}/status")
    public ResponseEntity<ApiResponse<PatientAssignmentDesk>> updatePatientCaseStatus(
            @PathVariable UUID petId,
            @RequestParam UUID doctorId,
            @RequestParam PatientAssignmentDesk.CaseStatus status) {

        PatientAssignmentDesk updated = doctorService.updateCaseStatus(doctorId, petId, status);
        return ResponseEntity.ok(ApiResponse.success("Patient case status updated to " + status, updated));
    }

    /**
     * Unassign / discharge a patient from doctor's desk
     */
    @DeleteMapping("/patients/{petId}/unassign")
    public ResponseEntity<ApiResponse<String>> unassignPatient(
            @PathVariable UUID petId,
            @RequestParam UUID doctorId) {

        doctorService.unassignPatient(doctorId, petId);
        return ResponseEntity.ok(ApiResponse.success("Pet patient unassigned from doctor's desk successfully", "UNASSIGNED"));
    }
}
