package com.jivathunai.marketplace.document;

import lombok.*;

import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicalInformation {
    private Map<String, String> activePharmaceuticalIngredients;
    private String dosageInstructions;
    private String contraindications;
    private String warnings;
}
