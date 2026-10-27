package com.jivathunai.medical.health.service;

import com.jivathunai.medical.health.dto.AssignPatientRequest;
import com.jivathunai.medical.health.entity.mongo.PatientAssignmentDesk;
import com.jivathunai.medical.health.entity.mongo.PetMedicalRecord;
import com.jivathunai.medical.health.entity.mysql.VetOrganization;
import com.jivathunai.medical.health.entity.mysql.VetStaffRegistry;
import com.jivathunai.medical.health.exception.ResourceNotFoundException;
import com.jivathunai.medical.health.repository.mongo.PatientAssignmentDeskRepository;
import com.jivathunai.medical.health.repository.mongo.PetMedicalRecordRepository;
import com.jivathunai.medical.health.repository.mysql.VetOrganizationRepository;
import com.jivathunai.medical.health.repository.mysql.VetStaffRegistryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class VetDoctorService {

    private final PatientAssignmentDeskRepository assignmentRepository;
    private final PetMedicalRecordRepository medicalRecordRepository;
    private final VetStaffRegistryRepository staffRegistryRepository;
    private final VetOrganizationRepository organizationRepository;

    /**
     * Link up to N active pet patients to a veterinary doctor within an organization.
     */
    public PatientAssignmentDesk assignPatients(AssignPatientRequest request) {
        log.info("🩺 [PATIENT_ASSIGNMENT] Assigning {} pets to Doctor ID: {} under Org: {}",
                request.petIds() != null ? request.petIds().size() : 0, request.doctorId(), request.parentOrganizationId());

        String doctorName = "Attending Veterinary Surgeon";
        Optional<VetStaffRegistry> staffOpt = staffRegistryRepository.findByUserId(request.doctorId());
        if (staffOpt.isPresent() && staffOpt.get().getDoctorName() != null) {
            doctorName = staffOpt.get().getDoctorName();
        }

        String hospitalName = "Jiva Thunai Veterinary Hospital";
        if (request.parentOrganizationId() != null) {
            Optional<VetOrganization> orgOpt = organizationRepository.findById(request.parentOrganizationId());
            if (orgOpt.isPresent() && orgOpt.get().getRegisteredBusinessName() != null) {
                hospitalName = orgOpt.get().getRegisteredBusinessName();
            }
        }

        List<PatientAssignmentDesk.ClinicalSummary> summaries = new ArrayList<>();
        List<UUID> validPetIds = request.petIds() != null ? request.petIds() : new ArrayList<>();

        for (UUID petId : validPetIds) {
            PetMedicalRecord petRecord = medicalRecordRepository.findByPetId(petId).orElseGet(() -> {
                PetMedicalRecord fresh = PetMedicalRecord.builder()
                        .petId(petId)
                        .petName("Pet Patient")
                        .allergies(new ArrayList<>())
                        .vitalSignsHistory(new ArrayList<>())
                        .vaccinationSchedule(new ArrayList<>())
                        .clinicalEPrescriptions(new ArrayList<>())
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .build();
                return medicalRecordRepository.save(fresh);
            });

            summaries.add(buildClinicalSummaryFromRecord(petRecord, PatientAssignmentDesk.CaseStatus.ACTIVE_TREATMENT));
        }

        PatientAssignmentDesk desk = PatientAssignmentDesk.builder()
                .assignmentId(UUID.randomUUID())
                .doctorId(request.doctorId())
                .doctorName(doctorName)
                .petIds(validPetIds)
                .parentOrganizationId(request.parentOrganizationId())
                .hospitalName(hospitalName)
                .caseStatus(PatientAssignmentDesk.CaseStatus.ACTIVE_TREATMENT)
                .clinicalPrescriptionTimelines(summaries)
                .build();

        PatientAssignmentDesk saved = assignmentRepository.save(desk);
        log.info("✅ Created PatientAssignmentDesk with ID: {}", saved.getAssignmentId());
        return saved;
    }

    /**
     * Retrieve all clinical summaries for a doctor's active patient assignments.
     */
    public List<PatientAssignmentDesk.ClinicalSummary> getDoctorPatientSummaries(UUID doctorId, String statusFilter) {
        log.info("📋 Fetching patient assignments for Doctor: {} with filter: {}", doctorId, statusFilter);

        PatientAssignmentDesk.CaseStatus targetStatus = null;
        if (statusFilter != null && !statusFilter.trim().isEmpty() && !"ALL".equalsIgnoreCase(statusFilter)) {
            try {
                targetStatus = PatientAssignmentDesk.CaseStatus.valueOf(statusFilter.toUpperCase());
            } catch (IllegalArgumentException ignored) {
            }
        }

        List<PatientAssignmentDesk> assignments;
        if (targetStatus != null) {
            assignments = assignmentRepository.findByDoctorIdAndCaseStatus(doctorId, targetStatus);
        } else {
            assignments = assignmentRepository.findByDoctorId(doctorId);
        }

        Set<UUID> assignedPetIds = new HashSet<>();
        for (PatientAssignmentDesk assignment : assignments) {
            if (assignment.getPetIds() != null) {
                assignedPetIds.addAll(assignment.getPetIds());
            }
        }

        // If no explicit assignments found for this doctor, check if all patients in the system should be shown
        // or query the medical repository for assigned pet IDs
        List<PatientAssignmentDesk.ClinicalSummary> result = new ArrayList<>();

        if (assignedPetIds.isEmpty()) {
            // Fallback: If no explicit assignment exists yet, fetch only active patient records
            List<PetMedicalRecord> allRecords = medicalRecordRepository.findAll();
            return allRecords.stream()
                    .filter(this::isPatientRecord)
                    .map(r -> buildClinicalSummaryFromRecord(r, PatientAssignmentDesk.CaseStatus.ACTIVE_TREATMENT))
                    .collect(Collectors.toList());
        }

        for (UUID petId : assignedPetIds) {
            Optional<PetMedicalRecord> recordOpt = medicalRecordRepository.findByPetId(petId);
            PatientAssignmentDesk.CaseStatus status = targetStatus != null ? targetStatus : PatientAssignmentDesk.CaseStatus.ACTIVE_TREATMENT;
            if (recordOpt.isPresent() && isPatientRecord(recordOpt.get())) {
                result.add(buildClinicalSummaryFromRecord(recordOpt.get(), status));
            }
        }

        return result;
    }

    /**
     * Update case status of a specific pet under a doctor (ACTIVE_TREATMENT, MONITORING, DISCHARGED)
     */
    public PatientAssignmentDesk updateCaseStatus(UUID doctorId, UUID petId, PatientAssignmentDesk.CaseStatus newStatus) {
        log.info("🔄 Doctor {} updating CaseStatus for Pet {} to {}", doctorId, petId, newStatus);
        List<PatientAssignmentDesk> desks = assignmentRepository.findByDoctorId(doctorId);

        PatientAssignmentDesk targetDesk = null;
        for (PatientAssignmentDesk d : desks) {
            if (d.getPetIds() != null && d.getPetIds().contains(petId)) {
                targetDesk = d;
                break;
            }
        }

        if (targetDesk == null) {
            // Create a new assignment for this pet and doctor with the updated status
            targetDesk = PatientAssignmentDesk.builder()
                    .assignmentId(UUID.randomUUID())
                    .doctorId(doctorId)
                    .petIds(List.of(petId))
                    .caseStatus(newStatus)
                    .clinicalPrescriptionTimelines(new ArrayList<>())
                    .build();
        }

        targetDesk.setCaseStatus(newStatus);
        if (targetDesk.getClinicalPrescriptionTimelines() != null) {
            for (PatientAssignmentDesk.ClinicalSummary s : targetDesk.getClinicalPrescriptionTimelines()) {
                if (petId.equals(s.getPetId())) {
                    s.setCaseStatus(newStatus);
                    s.setLastUpdated(LocalDateTime.now());
                }
            }
        }

        return assignmentRepository.save(targetDesk);
    }

    /**
     * Unassign / remove a pet patient from doctor's desk
     */
    public void unassignPatient(UUID doctorId, UUID petId) {
        log.info("Doctor {} unassigning Pet {}", doctorId, petId);
        List<PatientAssignmentDesk> desks = assignmentRepository.findByDoctorId(doctorId);
        for (PatientAssignmentDesk desk : desks) {
            if (desk.getPetIds() != null && desk.getPetIds().contains(petId)) {
                desk.getPetIds().remove(petId);
                if (desk.getClinicalPrescriptionTimelines() != null) {
                    desk.getClinicalPrescriptionTimelines().removeIf(s -> petId.equals(s.getPetId()));
                }
                if (desk.getPetIds().isEmpty()) {
                    assignmentRepository.delete(desk);
                } else {
                    assignmentRepository.save(desk);
                }
            }
        }
    }

    /**
     * Get complete real-time clinical snapshot for a particular Pet
     */
    public PatientAssignmentDesk.ClinicalSummary getPatientClinicalSnapshot(UUID petId) {
        PetMedicalRecord record = medicalRecordRepository.findByPetId(petId)
                .orElseThrow(() -> new ResourceNotFoundException("No medical record found for Pet ID: " + petId));

        return buildClinicalSummaryFromRecord(record, PatientAssignmentDesk.CaseStatus.ACTIVE_TREATMENT);
    }

    public PatientAssignmentDesk.ClinicalSummary buildClinicalSummaryFromRecord(PetMedicalRecord record, PatientAssignmentDesk.CaseStatus caseStatus) {
        List<String> activePrescriptions = new ArrayList<>();
        List<String> diagnosticReports = new ArrayList<>();

        if (record.getClinicalEPrescriptions() != null) {
            for (PetMedicalRecord.ClinicalEPrescription rx : record.getClinicalEPrescriptions()) {
                if (rx.getMedicines() != null) {
                    for (PetMedicalRecord.MedicineItem med : rx.getMedicines()) {
                        activePrescriptions.add(med.getMedicineName() + " (" + (med.getDosage() != null ? med.getDosage() : "Standard") + ")");
                    }
                }
                if (rx.getDiagnosticMedia() != null) {
                    for (PetMedicalRecord.DiagnosticMediaItem media : rx.getDiagnosticMedia()) {
                        diagnosticReports.add(media.getFileUrl() != null ? media.getFileUrl() : media.getTitle());
                    }
                }
            }
        }

        List<PatientAssignmentDesk.VaccinationSchedule> vaxSchedules = new ArrayList<>();
        if (record.getVaccinationSchedule() != null) {
            for (PetMedicalRecord.VaccinationEntry v : record.getVaccinationSchedule()) {
                vaxSchedules.add(PatientAssignmentDesk.VaccinationSchedule.builder()
                        .vaccineName(v.getVaccineName())
                        .scheduledDate(v.getNextDueDate() != null ? v.getNextDueDate().atStartOfDay() : (v.getAdministeredDate() != null ? v.getAdministeredDate().atStartOfDay() : LocalDateTime.now()))
                        .administered(v.getStatus() == PetMedicalRecord.VaccinationStatus.ADMINISTERED)
                        .build());
            }
        }

        List<String> allergyList = new ArrayList<>();
        if (record.getAllergies() != null) {
            for (PetMedicalRecord.AllergyItem a : record.getAllergies()) {
                if (a.isActive() && a.getAllergen() != null) {
                    allergyList.add(a.getAllergen() + " (" + (a.getSeverity() != null ? a.getSeverity().name() : "HIGH") + ")");
                }
            }
        }

        Double lastWeight = null;
        Double lastTemp = null;
        Integer lastHeartRate = null;
        Integer lastRespiration = null;

        if (record.getVitalSignsHistory() != null && !record.getVitalSignsHistory().isEmpty()) {
            PetMedicalRecord.VitalSignEntry latestVital = record.getVitalSignsHistory().get(0);
            lastWeight = latestVital.getWeightKg();
            lastTemp = latestVital.getTemperatureCelsius();
            lastHeartRate = latestVital.getHeartRateBpm();
            lastRespiration = latestVital.getRespirationRateBpm();
        }

        return PatientAssignmentDesk.ClinicalSummary.builder()
                .petId(record.getPetId())
                .petName(record.getPetName())
                .species(record.getSpecies())
                .breed(record.getBreed())
                .ownerName(record.getOwnerName())
                .ownerPhone(record.getOwnerPhone())
                .bloodGroup(record.getBloodGroup())
                .activePrescriptions(activePrescriptions)
                .diagnosticReports(diagnosticReports)
                .automatedVaccinationSchedules(vaxSchedules)
                .allergies(allergyList)
                .lastWeightKg(lastWeight)
                .lastTemperatureCelsius(lastTemp)
                .lastHeartRateBpm(lastHeartRate)
                .lastRespirationRateBpm(lastRespiration)
                .caseStatus(caseStatus != null ? caseStatus : PatientAssignmentDesk.CaseStatus.ACTIVE_TREATMENT)
                .lastUpdated(record.getUpdatedAt() != null ? record.getUpdatedAt() : LocalDateTime.now())
                .build();
    }

    private boolean isPatientRecord(PetMedicalRecord r) {
        if (r == null) return false;
        boolean hasPrescriptions = r.getClinicalEPrescriptions() != null && !r.getClinicalEPrescriptions().isEmpty();
        boolean hasAllergies = r.getAllergies() != null && !r.getAllergies().isEmpty();
        boolean hasVaccines = r.getVaccinationSchedule() != null && !r.getVaccinationSchedule().isEmpty();
        boolean hasVitals = r.getVitalSignsHistory() != null && !r.getVitalSignsHistory().isEmpty();
        return hasPrescriptions || hasAllergies || hasVaccines || hasVitals;
    }
}
