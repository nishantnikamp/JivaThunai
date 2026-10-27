package com.jivathunai.adoption.document;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BehavioralMatrix {
    private boolean isHouseTrained;
    private Integer kidsFriendlyScale; // 1 to 5 or 10
    private Integer catFriendlyScale;
    private Integer dogFriendlyScale;
    private String leashTolerance;
    private String biteRiskHistoryNotes;
    private String energyDescription;
}
