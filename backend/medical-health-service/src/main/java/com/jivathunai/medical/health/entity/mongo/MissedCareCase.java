package com.jivathunai.medical.health.entity.mongo;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Missed Care Detection & Follow-up Entity
 * Implements Innovation 2: Compare required care with recorded completion, identify overdue actions and guide next steps.
 */
@Document(collection = "missed_care_cases")
@CompoundIndexes({
    @CompoundIndex(name = "case_owner_status_idx", def = "{'ownerId': 1, 'caseStatus': 1}"),
    @CompoundIndex(name = "case_pet_idx", def = "{'petId': 1}"),
    @CompoundIndex(name = "case_task_idx", def = "{'careTaskId': 1}")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MissedCareCase {

    @Id
    private String id;

    @Indexed(unique = true)
    @Builder.Default
    private UUID caseId = UUID.randomUUID();

    private UUID petId;
    private String petName;

    private UUID ownerId;
    private String ownerName;

    private String carePlanId;
    private UUID careTaskId;
    private String taskTitle;
    private String taskType;
    private LocalDateTime dueAt;

    @Builder.Default
    private CaseSeverity severity = CaseSeverity.MEDIUM;

    @Builder.Default
    private CaseStatus caseStatus = CaseStatus.OPEN;

    @CreatedDate
    private LocalDateTime detectedAt;

    private String recommendedNextAction; // CONFIRM_COMPLETION, SCHEDULE_FOLLOW_UP, CONTACT_HOSPITAL, EMERGENCY_GUIDANCE
    private String guidanceText;
    private String resolutionReason;
    private LocalDateTime resolvedAt;
    private UUID resolvedByUserId;
    private String resolvedByName;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public enum CaseSeverity {
        LOW, MEDIUM, HIGH, CRITICAL
    }

    public enum CaseStatus {
        OPEN, AWAITING_OWNER, AWAITING_VETERINARIAN, RESOLVED, CLOSED
    }
}
