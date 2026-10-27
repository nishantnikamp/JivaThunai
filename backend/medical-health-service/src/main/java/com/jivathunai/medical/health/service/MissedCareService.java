package com.jivathunai.medical.health.service;

import com.jivathunai.medical.health.dto.MissedCareActionRequest;
import com.jivathunai.medical.health.entity.mongo.MissedCareCase;
import com.jivathunai.medical.health.entity.mongo.PetCarePlan;
import com.jivathunai.medical.health.repository.mongo.MissedCareCaseRepository;
import com.jivathunai.medical.health.repository.mongo.PetCarePlanRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class MissedCareService {

    private final MissedCareCaseRepository caseRepository;
    private final PetCarePlanRepository planRepository;

    /**
     * Deterministic rule-based detection engine
     * Evaluates active care plans and flags overdue/unconfirmed tasks.
     */
    public List<MissedCareCase> evaluateMissedCare() {
        log.info("Running deterministic Missed-Care evaluation engine");
        List<PetCarePlan> activePlans = planRepository.findByStatus(PetCarePlan.PlanStatus.ACTIVE);
        List<MissedCareCase> newOrUpdatedCases = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        for (PetCarePlan plan : activePlans) {
            boolean planModified = false;
            for (PetCarePlan.CareTask task : plan.getTasks()) {
                if (task.getStatus() == PetCarePlan.TaskStatus.COMPLETED ||
                    task.getStatus() == PetCarePlan.TaskStatus.CANCELLED ||
                    task.getStatus() == PetCarePlan.TaskStatus.SUPERSEDED) {
                    continue;
                }

                // Check if task is overdue
                if (task.getDueAt() != null && task.getDueAt().isBefore(now)) {
                    task.setStatus(PetCarePlan.TaskStatus.OVERDUE);
                    planModified = true;

                    // Check if an open case already exists for this task
                    Optional<MissedCareCase> existingCaseOpt = caseRepository
                            .findByCareTaskIdAndCaseStatusNot(task.getTaskId(), MissedCareCase.CaseStatus.RESOLVED);

                    if (existingCaseOpt.isEmpty()) {
                        MissedCareCase.CaseSeverity severity = MissedCareCase.CaseSeverity.MEDIUM;
                        String nextAction = "CONFIRM_COMPLETION";
                        String guidance = "Please verify whether this scheduled care was administered.";

                        if (task.getTaskType() == PetCarePlan.TaskType.MEDICATION) {
                            severity = MissedCareCase.CaseSeverity.HIGH;
                            guidance = "Prescribed medication dose is overdue. Do not double dose without veterinary approval. Please confirm or consult your veterinarian.";
                        } else if (task.getTaskType() == PetCarePlan.TaskType.FOLLOW_UP) {
                            severity = MissedCareCase.CaseSeverity.HIGH;
                            nextAction = "SCHEDULE_FOLLOW_UP";
                            guidance = "Recommended clinical re-check date has passed without recorded attendance. Please schedule a visit or confirm visit completion.";
                        } else if (task.getTaskType() == PetCarePlan.TaskType.RECOVERY_CHECK) {
                            severity = MissedCareCase.CaseSeverity.CRITICAL;
                            guidance = "Post-surgical recovery check is overdue. If pet exhibits distress, contact the emergency hotline immediately.";
                        }

                        MissedCareCase newCase = MissedCareCase.builder()
                                .caseId(UUID.randomUUID())
                                .petId(plan.getPetId())
                                .petName(plan.getPetName())
                                .ownerId(plan.getOwnerId())
                                .ownerName(plan.getOwnerName())
                                .carePlanId(plan.getId())
                                .careTaskId(task.getTaskId())
                                .taskTitle(task.getTitle())
                                .taskType(task.getTaskType() != null ? task.getTaskType().name() : "MEDICATION")
                                .dueAt(task.getDueAt())
                                .severity(severity)
                                .caseStatus(MissedCareCase.CaseStatus.OPEN)
                                .recommendedNextAction(nextAction)
                                .guidanceText(guidance)
                                .build();

                        MissedCareCase saved = caseRepository.save(newCase);
                        newOrUpdatedCases.add(saved);
                        log.warn("Created Missed-Care Case {} for pet {} (Task: {})", saved.getCaseId(), plan.getPetName(), task.getTitle());
                    }
                }
            }

            if (planModified) {
                planRepository.save(plan);
            }
        }

        return newOrUpdatedCases;
    }

    public List<MissedCareCase> getCasesByOwner(UUID ownerId) {
        return caseRepository.findByOwnerIdOrderByDetectedAtDesc(ownerId);
    }

    public List<MissedCareCase> getCasesByPet(UUID petId) {
        return caseRepository.findByPetIdOrderByDetectedAtDesc(petId);
    }

    public List<MissedCareCase> getOpenCases() {
        return caseRepository.findByCaseStatus(MissedCareCase.CaseStatus.OPEN);
    }

    public MissedCareCase resolveCase(UUID caseId, MissedCareActionRequest request) {
        MissedCareCase careCase = caseRepository.findByCaseId(caseId)
                .orElseThrow(() -> new IllegalArgumentException("Missed care case not found: " + caseId));

        careCase.setCaseStatus(MissedCareCase.CaseStatus.RESOLVED);
        careCase.setResolutionReason(request.getResolutionNotes() != null ? request.getResolutionNotes() : "Action performed: " + request.getActionType());
        careCase.setResolvedAt(LocalDateTime.now());
        careCase.setResolvedByUserId(request.getActorUserId());
        careCase.setResolvedByName(request.getActorName());

        // Update the underlying task status if confirmed completed
        if ("CONFIRM_COMPLETED".equalsIgnoreCase(request.getActionType()) && careCase.getCarePlanId() != null) {
            planRepository.findById(careCase.getCarePlanId()).ifPresent(plan -> {
                plan.getTasks().stream()
                        .filter(t -> t.getTaskId().equals(careCase.getCareTaskId()))
                        .findFirst()
                        .ifPresent(task -> {
                            task.setStatus(PetCarePlan.TaskStatus.COMPLETED);
                            task.setCompletedAt(LocalDateTime.now());
                            task.setCompletedByUserId(request.getActorUserId());
                            task.setCompletedByName(request.getActorName());
                            task.setCompletionNotes("Resolved via Missed-Care Action Desk: " + request.getResolutionNotes());
                            planRepository.save(plan);
                        });
            });
        }

        log.info("Resolved Missed-Care Case {} via action: {}", caseId, request.getActionType());
        return caseRepository.save(careCase);
    }
}
