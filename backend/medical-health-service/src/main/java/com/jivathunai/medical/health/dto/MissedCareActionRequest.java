package com.jivathunai.medical.health.dto;

import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MissedCareActionRequest {
    private String actionType; // CONFIRM_COMPLETED, RESCHEDULE, CONTACT_HOSPITAL, DISMISS
    private String resolutionNotes;
    private UUID actorUserId;
    private String actorName;
}
