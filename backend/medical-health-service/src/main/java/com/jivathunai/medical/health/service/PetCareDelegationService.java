package com.jivathunai.medical.health.service;

import com.jivathunai.medical.health.dto.CreateDelegationRequest;
import com.jivathunai.medical.health.entity.mongo.PetCareDelegation;
import com.jivathunai.medical.health.entity.mongo.PetCarePlan;
import com.jivathunai.medical.health.entity.mongo.PetMedicalRecord;
import com.jivathunai.medical.health.repository.mongo.PetCareDelegationRepository;
import com.jivathunai.medical.health.repository.mongo.PetCarePlanRepository;
import com.jivathunai.medical.health.repository.mongo.PetMedicalRecordRepository;
import lombok.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class PetCareDelegationService {

    private final PetCareDelegationRepository delegationRepository;
    private final PetMedicalRecordRepository medicalRecordRepository;
    private final PetCarePlanRepository planRepository;

    public PetCareDelegation createDelegation(CreateDelegationRequest request) {
        log.info("Creating temporary pet care delegation for pet: {} to caretaker: {}", request.getPetId(), request.getCaretakerEmail());

        if (request.getExpiresAt().isBefore(request.getStartsAt())) {
            throw new IllegalArgumentException("Delegation expiry time must be after the start time");
        }

        String invitationToken = UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase();

        List<String> permissions = request.getAllowedPermissions();
        if (permissions == null || permissions.isEmpty()) {
            permissions = List.of(
                    "VIEW_FEEDING",
                    "VIEW_ALLERGIES",
                    "VIEW_MEDICATIONS",
                    "VIEW_EMERGENCY_CONTACTS",
                    "VIEW_CARE_TASKS",
                    "RECORD_TASK_COMPLETION"
            );
        }

        List<PetCareDelegation.DelegationActivityEntry> activities = new ArrayList<>();
        activities.add(PetCareDelegation.DelegationActivityEntry.builder()
                .timestamp(LocalDateTime.now())
                .actorUserId(request.getOwnerUserId())
                .actorRole("PET_OWNER")
                .action("DELEGATION_CREATED")
                .details("Delegated care access granted until " + request.getExpiresAt())
                .build());

        PetCareDelegation delegation = PetCareDelegation.builder()
                .delegationId(UUID.randomUUID())
                .petId(request.getPetId())
                .petName(request.getPetName())
                .species(request.getSpecies())
                .breed(request.getBreed())
                .ownerUserId(request.getOwnerUserId())
                .ownerName(request.getOwnerName())
                .ownerPhone(request.getOwnerPhone())
                .caretakerUserId(request.getCaretakerUserId())
                .caretakerEmail(request.getCaretakerEmail())
                .caretakerName(request.getCaretakerName() != null ? request.getCaretakerName() : request.getCaretakerEmail().split("@")[0])
                .invitationToken(invitationToken)
                .startsAt(request.getStartsAt())
                .expiresAt(request.getExpiresAt())
                .delegationStatus(PetCareDelegation.DelegationStatus.ACTIVE)
                .allowedPermissions(permissions)
                .notes(request.getNotes())
                .emergencyVetContact(request.getEmergencyVetContact() != null ? request.getEmergencyVetContact() : "+91-80-2520-9999 (National Vet 24/7)")
                .feedingSchedule(request.getFeedingSchedule() != null ? request.getFeedingSchedule() : "Twice daily (08:00 AM & 08:00 PM) - 1.5 cups dry kibble")
                .activityLog(activities)
                .build();

        return delegationRepository.save(delegation);
    }

    public List<PetCareDelegation> getDelegationsByOwner(UUID ownerId) {
        List<PetCareDelegation> delegations = delegationRepository.findByOwnerUserIdOrderByCreatedAtDesc(ownerId);
        // Automatically check expiry
        LocalDateTime now = LocalDateTime.now();
        for (PetCareDelegation d : delegations) {
            if (d.getDelegationStatus() == PetCareDelegation.DelegationStatus.ACTIVE && d.getExpiresAt().isBefore(now)) {
                d.setDelegationStatus(PetCareDelegation.DelegationStatus.EXPIRED);
                delegationRepository.save(d);
            }
        }
        return delegations;
    }

    public List<PetCareDelegation> getDelegationsForCaretaker(UUID caretakerUserId, String email) {
        LocalDateTime now = LocalDateTime.now();
        List<PetCareDelegation> list = new ArrayList<>();

        if (caretakerUserId != null) {
            list.addAll(delegationRepository.findByCaretakerUserIdAndDelegationStatus(caretakerUserId, PetCareDelegation.DelegationStatus.ACTIVE));
        }
        if (email != null && !email.trim().isEmpty()) {
            list.addAll(delegationRepository.findByCaretakerEmailAndDelegationStatus(email.trim().toLowerCase(), PetCareDelegation.DelegationStatus.ACTIVE));
        }

        // Filter expired
        List<PetCareDelegation> activeList = new ArrayList<>();
        for (PetCareDelegation d : list) {
            if (d.getExpiresAt().isBefore(now)) {
                d.setDelegationStatus(PetCareDelegation.DelegationStatus.EXPIRED);
                delegationRepository.save(d);
            } else {
                activeList.add(d);
            }
        }

        return activeList;
    }

    public List<PetCareDelegation> getDelegationsByPet(UUID petId) {
        return delegationRepository.findByPetId(petId);
    }

    public PetCareDelegation revokeDelegation(UUID delegationId, UUID requestingUserId, String reason) {
        PetCareDelegation delegation = delegationRepository.findByDelegationId(delegationId)
                .orElseThrow(() -> new IllegalArgumentException("Delegation not found: " + delegationId));

        delegation.setDelegationStatus(PetCareDelegation.DelegationStatus.REVOKED);
        delegation.setRevokedAt(LocalDateTime.now());
        delegation.setRevocationReason(reason != null ? reason : "Revoked by pet owner");

        delegation.getActivityLog().add(PetCareDelegation.DelegationActivityEntry.builder()
                .timestamp(LocalDateTime.now())
                .actorUserId(requestingUserId)
                .actorRole("PET_OWNER")
                .action("DELEGATION_REVOKED")
                .details("Access revoked: " + reason)
                .build());

        log.info("Delegation {} revoked: {}", delegationId, reason);
        return delegationRepository.save(delegation);
    }

    /**
     * Caretaker Restricted Dashboard: Returns only least-privilege information allowed by this delegation.
     */
    public CaretakerDashboardDto getCaretakerDashboard(UUID delegationId, UUID caretakerUserId) {
        PetCareDelegation delegation = delegationRepository.findByDelegationId(delegationId)
                .orElseThrow(() -> new IllegalArgumentException("Delegation not found: " + delegationId));

        if (delegation.getDelegationStatus() != PetCareDelegation.DelegationStatus.ACTIVE) {
            throw new IllegalStateException("Delegation is not active (Status: " + delegation.getDelegationStatus() + ")");
        }
        if (delegation.getExpiresAt().isBefore(LocalDateTime.now())) {
            delegation.setDelegationStatus(PetCareDelegation.DelegationStatus.EXPIRED);
            delegationRepository.save(delegation);
            throw new IllegalStateException("Delegation expired at: " + delegation.getExpiresAt());
        }

        // Log access
        delegation.getActivityLog().add(PetCareDelegation.DelegationActivityEntry.builder()
                .timestamp(LocalDateTime.now())
                .actorUserId(caretakerUserId)
                .actorRole("CARETAKER")
                .action("DASHBOARD_ACCESSED")
                .details("Caretaker viewed assigned pet dashboard")
                .build());
        delegationRepository.save(delegation);

        // Fetch medical record for allergies and medications
        Optional<PetMedicalRecord> medicalOpt = medicalRecordRepository.findByPetId(delegation.getPetId());
        List<PetMedicalRecord.AllergyItem> allergies = new ArrayList<>();
        List<String> approvedMeds = new ArrayList<>();

        if (medicalOpt.isPresent()) {
            PetMedicalRecord mr = medicalOpt.get();
            if (delegation.getAllowedPermissions().contains("VIEW_ALLERGIES") && mr.getAllergies() != null) {
                allergies = mr.getAllergies().stream().filter(PetMedicalRecord.AllergyItem::isActive).toList();
            }
            if (delegation.getAllowedPermissions().contains("VIEW_MEDICATIONS") && mr.getClinicalEPrescriptions() != null) {
                for (PetMedicalRecord.ClinicalEPrescription rx : mr.getClinicalEPrescriptions()) {
                    if (rx.getMedicines() != null) {
                        for (PetMedicalRecord.MedicineItem med : rx.getMedicines()) {
                            approvedMeds.add(med.getMedicineName() + " (" + med.getDosage() + ") - " + med.getFrequency() + " [" + med.getInstructions() + "]");
                        }
                    }
                }
            }
        }

        // Fetch care tasks
        List<PetCarePlan.CareTask> tasks = new ArrayList<>();
        if (delegation.getAllowedPermissions().contains("VIEW_CARE_TASKS")) {
            Optional<PetCarePlan> planOpt = planRepository.findFirstByPetIdAndStatus(delegation.getPetId(), PetCarePlan.PlanStatus.ACTIVE);
            planOpt.ifPresent(plan -> tasks.addAll(plan.getTasks()));
        }

        return CaretakerDashboardDto.builder()
                .delegationId(delegation.getDelegationId())
                .petId(delegation.getPetId())
                .petName(delegation.getPetName())
                .species(delegation.getSpecies())
                .breed(delegation.getBreed())
                .startsAt(delegation.getStartsAt())
                .expiresAt(delegation.getExpiresAt())
                .feedingSchedule(delegation.getAllowedPermissions().contains("VIEW_FEEDING") ? delegation.getFeedingSchedule() : "Not shared")
                .emergencyVetContact(delegation.getAllowedPermissions().contains("VIEW_EMERGENCY_CONTACTS") ? delegation.getEmergencyVetContact() : "+91-80-2520-9999")
                .notes(delegation.getNotes())
                .activeAllergies(allergies)
                .approvedMedications(approvedMeds)
                .assignedTasks(tasks)
                .allowedPermissions(delegation.getAllowedPermissions())
                .build();
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CaretakerDashboardDto {
        private UUID delegationId;
        private UUID petId;
        private String petName;
        private String species;
        private String breed;
        private LocalDateTime startsAt;
        private LocalDateTime expiresAt;
        private String feedingSchedule;
        private String emergencyVetContact;
        private String notes;
        private List<PetMedicalRecord.AllergyItem> activeAllergies;
        private List<String> approvedMedications;
        private List<PetCarePlan.CareTask> assignedTasks;
        private List<String> allowedPermissions;
    }
}
