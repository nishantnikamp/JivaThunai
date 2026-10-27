package com.jivathunai.medical.health.dto;

import com.jivathunai.medical.health.entity.mongo.PetMedicalRecord;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddAllergyRequest {

    @NotBlank(message = "Allergen name is required")
    private String allergen;

    @Builder.Default
    private PetMedicalRecord.AllergySeverity severity = PetMedicalRecord.AllergySeverity.MODERATE;

    private String reaction;

    @Builder.Default
    private boolean active = true;
}
