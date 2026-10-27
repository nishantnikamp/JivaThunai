package com.jivathunai.medical.health.entity.mongo;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Care Continuity & Next-Care Planning Entity
 * Implements Innovation 1: Convert veterinary prescriptions and visits into trackable care tasks.
 */
@Document(collection = "pet_care_plans")
@CompoundIndexes({
    @CompoundIndex(name = "plan_pet_status_idx", def = "{'petId': 1, 'status': 1}"),
    @CompoundIndex(name = "plan_owner_idx", def = "{'ownerId': 1}")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PetCarePlan {

    @Id
    private String id;

    private UUID petId;

    private String petName;

    private UUID ownerId;

    private String ownerName;

    private UUID doctorId;
    private String doctorName;
    private String clinicName;

    private String treatmentPlanTitle;
    private String diagnosedIllness;
    private String clinicalInstructions;

    @Builder.Default
    private PlanStatus status = PlanStatus.ACTIVE;

    @Builder.Default
    private Integer version = 1;

    @Builder.Default
    private List<CareTask> tasks = new ArrayList<>();

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public enum PlanStatus {
        ACTIVE, COMPLETED, REVISED, CANCELLED
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CareTask {
        @Builder.Default
        private UUID taskId = UUID.randomUUID();

        private TaskType taskType;
        private String title;
        private String instructions;
        private LocalDateTime dueAt;

        @Builder.Default
        private TaskPriority priority = TaskPriority.ROUTINE;

        @Builder.Default
        private TaskStatus status = TaskStatus.PLANNED;

        @Builder.Default
        private String responsibleRole = "OWNER"; // OWNER, CARETAKER, DOCTOR

        private String sourceInstruction; // e.g. "Prescription Rx-894", "Follow-up check"
        private LocalDateTime completedAt;
        private UUID completedByUserId;
        private String completedByName;
        private String completedByRole;
        private String completionNotes;
        private String cancellationReason;
    }

    public enum TaskType {
        MEDICATION, FOLLOW_UP, RECOVERY_CHECK, VACCINATION_BOOSTER, DIAGNOSTIC_TEST
    }

    public enum TaskPriority {
        ROUTINE, URGENT, EMERGENCY
    }

    public enum TaskStatus {
        PLANNED, DUE, COMPLETION_REPORTED, COMPLETED, OVERDUE, AWAITING_REVIEW, CANCELLED, SUPERSEDED
    }
}
