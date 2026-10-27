package com.jivathunai.medical.health.service;

import com.jivathunai.medical.health.dto.CompleteCareTaskRequest;
import com.jivathunai.medical.health.dto.CreateCarePlanRequest;
import com.jivathunai.medical.health.entity.mongo.PetCarePlan;
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
public class CarePlanService {

    private final PetCarePlanRepository planRepository;

    private UUID toUuid(String val) {
        if (val == null || val.trim().isEmpty()) return UUID.randomUUID();
        try {
            return UUID.fromString(val.trim());
        } catch (IllegalArgumentException e) {
            return UUID.nameUUIDFromBytes(val.trim().getBytes(java.nio.charset.StandardCharsets.UTF_8));
        }
    }

    private LocalDateTime parseDueAt(String dueAtStr) {
        if (dueAtStr == null || dueAtStr.trim().isEmpty()) return LocalDateTime.now().plusDays(1);
        try {
            String clean = dueAtStr.trim();
            if (clean.length() == 16) {
                return LocalDateTime.parse(clean, java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm"));
            }
            return LocalDateTime.parse(clean.replace("Z", ""), java.time.format.DateTimeFormatter.ISO_LOCAL_DATE_TIME);
        } catch (Exception e) {
            return LocalDateTime.now().plusDays(1);
        }
    }

    private PetCarePlan.TaskType parseTaskType(String typeStr) {
        if (typeStr == null || typeStr.trim().isEmpty()) return PetCarePlan.TaskType.MEDICATION;
        try {
            return PetCarePlan.TaskType.valueOf(typeStr.trim().toUpperCase());
        } catch (Exception e) {
            return PetCarePlan.TaskType.MEDICATION;
        }
    }

    private PetCarePlan.TaskPriority parseTaskPriority(String priorityStr) {
        if (priorityStr == null || priorityStr.trim().isEmpty()) return PetCarePlan.TaskPriority.ROUTINE;
        try {
            return PetCarePlan.TaskPriority.valueOf(priorityStr.trim().toUpperCase());
        } catch (Exception e) {
            return PetCarePlan.TaskPriority.ROUTINE;
        }
    }

    public PetCarePlan createCarePlan(CreateCarePlanRequest request) {
        UUID petUuid = toUuid(request.getPetId());
        log.info("Creating new Care Plan for pet: {}", petUuid);

        // Archive any previous active care plan for this pet
        Optional<PetCarePlan> activePlanOpt = planRepository.findFirstByPetIdAndStatus(petUuid, PetCarePlan.PlanStatus.ACTIVE);
        activePlanOpt.ifPresent(prev -> {
            prev.setStatus(PetCarePlan.PlanStatus.REVISED);
            planRepository.save(prev);
        });

        List<PetCarePlan.CareTask> tasks = new ArrayList<>();
        if (request.getInitialTasks() != null) {
            for (CreateCarePlanRequest.CareTaskDto taskDto : request.getInitialTasks()) {
                tasks.add(PetCarePlan.CareTask.builder()
                        .taskId(UUID.randomUUID())
                        .taskType(parseTaskType(taskDto.getTaskType()))
                        .title(taskDto.getTitle() != null && !taskDto.getTitle().trim().isEmpty() ? taskDto.getTitle().trim() : "Care Task")
                        .instructions(taskDto.getInstructions())
                        .dueAt(parseDueAt(taskDto.getDueAt()))
                        .priority(parseTaskPriority(taskDto.getPriority()))
                        .status(PetCarePlan.TaskStatus.PLANNED)
                        .responsibleRole(taskDto.getResponsibleRole() != null ? taskDto.getResponsibleRole() : "OWNER")
                        .sourceInstruction(taskDto.getSourceInstruction() != null ? taskDto.getSourceInstruction() : "Veterinary Care Plan")
                        .build());
            }
        }

        int nextVer = activePlanOpt.map(p -> (p.getVersion() != null ? p.getVersion() : 1) + 1).orElse(1);

        PetCarePlan newPlan = PetCarePlan.builder()
                .petId(petUuid)
                .petName(request.getPetName() != null && !request.getPetName().trim().isEmpty() ? request.getPetName().trim() : "Pet Patient")
                .ownerId(toUuid(request.getOwnerId()))
                .ownerName(request.getOwnerName() != null && !request.getOwnerName().trim().isEmpty() ? request.getOwnerName().trim() : "Pet Guardian")
                .doctorId(toUuid(request.getDoctorId()))
                .doctorName(request.getDoctorName() != null && !request.getDoctorName().trim().isEmpty() ? request.getDoctorName().trim() : "Attending Veterinarian")
                .clinicName(request.getClinicName() != null ? request.getClinicName() : "Jiva Thunai Veterinary Hospital")
                .treatmentPlanTitle(request.getTreatmentPlanTitle())
                .diagnosedIllness(request.getDiagnosedIllness())
                .clinicalInstructions(request.getClinicalInstructions())
                .status(PetCarePlan.PlanStatus.ACTIVE)
                .version(nextVer)
                .tasks(tasks)
                .build();

        return planRepository.save(newPlan);
    }

    public List<PetCarePlan> getCarePlansByPet(UUID petId) {
        return planRepository.findByPetIdOrderByCreatedAtDesc(petId);
    }

    public Optional<PetCarePlan> getActiveCarePlan(UUID petId) {
        return planRepository.findFirstByPetIdAndStatus(petId, PetCarePlan.PlanStatus.ACTIVE);
    }

    public List<PetCarePlan> getCarePlansByOwner(UUID ownerId) {
        return planRepository.findByOwnerIdOrderByCreatedAtDesc(ownerId);
    }

    public PetCarePlan completeCareTask(String planId, UUID taskId, CompleteCareTaskRequest request) {
        PetCarePlan plan = planRepository.findById(planId)
                .orElseThrow(() -> new IllegalArgumentException("Care plan not found with ID: " + planId));

        PetCarePlan.CareTask targetTask = plan.getTasks().stream()
                .filter(t -> t.getTaskId().equals(taskId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Care task not found with ID: " + taskId));

        targetTask.setStatus(PetCarePlan.TaskStatus.COMPLETED);
        targetTask.setCompletedAt(LocalDateTime.now());
        targetTask.setCompletedByUserId(request.getCompletedByUserId());
        targetTask.setCompletedByName(request.getCompletedByName());
        targetTask.setCompletedByRole(request.getCompletedByRole());
        targetTask.setCompletionNotes(request.getCompletionNotes());

        log.info("Care task {} marked COMPLETED by {}", taskId, request.getCompletedByName());

        // If all tasks are completed, mark plan completed
        boolean allDone = plan.getTasks().stream()
                .allMatch(t -> t.getStatus() == PetCarePlan.TaskStatus.COMPLETED || t.getStatus() == PetCarePlan.TaskStatus.CANCELLED);
        if (allDone && !plan.getTasks().isEmpty()) {
            plan.setStatus(PetCarePlan.PlanStatus.COMPLETED);
        }

        return planRepository.save(plan);
    }

    public PetCarePlan cancelCareTask(String planId, UUID taskId, String reason) {
        PetCarePlan plan = planRepository.findById(planId)
                .orElseThrow(() -> new IllegalArgumentException("Care plan not found with ID: " + planId));

        PetCarePlan.CareTask targetTask = plan.getTasks().stream()
                .filter(t -> t.getTaskId().equals(taskId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Care task not found with ID: " + taskId));

        targetTask.setStatus(PetCarePlan.TaskStatus.CANCELLED);
        targetTask.setCancellationReason(reason);
        log.info("Care task {} cancelled: {}", taskId, reason);

        return planRepository.save(plan);
    }
}
