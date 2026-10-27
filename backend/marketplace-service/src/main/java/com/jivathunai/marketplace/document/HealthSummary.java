package com.jivathunai.marketplace.document;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HealthSummary {
    private boolean isDeWormed;
    private List<String> activeImmunizations;
    private List<String> knownAllergies;
}
