package com.jivathunai.medical.health.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateCarePlanRequest {

    private String petId;
    private String petName;
    private String ownerId;
    private String ownerName;

    private String doctorId;
    private String doctorName;
    private String clinicName;

    @NotBlank(message = "Treatment plan title is required")
    private String treatmentPlanTitle;

    private String diagnosedIllness;
    private String clinicalInstructions;

    @Builder.Default
    private List<CareTaskDto> initialTasks = new ArrayList<>();

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CareTaskDto {
        private String taskType;
        private String title;
        private String instructions;
        private String dueAt;
        private String priority;
        private String responsibleRole;
        private String sourceInstruction;
    }
}
