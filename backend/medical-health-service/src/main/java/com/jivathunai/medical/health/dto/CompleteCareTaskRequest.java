package com.jivathunai.medical.health.dto;

import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompleteCareTaskRequest {
    private String completionNotes;
    private UUID completedByUserId;
    private String completedByName;
    private String completedByRole;
}
