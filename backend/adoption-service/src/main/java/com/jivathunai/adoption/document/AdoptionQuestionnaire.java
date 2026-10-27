package com.jivathunai.adoption.document;

import com.jivathunai.common.enums.HouseType;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "adoption_questionnaires")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdoptionQuestionnaire {

    @Id
    private String id;

    private Long applicantId;
    private Long petId;

    private HouseType houseType;
    private boolean isRental;
    private boolean landlordApproved;
    private boolean hasOutdoorArea;
    private Double outdoorAreaSqFt;

    private Integer dailyWorkingHours;
    private String experienceLevel; // BEGINNER, INTERMEDIATE, EXPERIENCED
    private boolean hasChildrenAtHome;
    private boolean hasSeniorCitizens;
    private boolean hasOtherPets;
    private String existingPetsDescription;

    private String reasonForAdopting;
    private String emergencyVetPlan;
    private boolean acceptsPcaAct1960Terms;
    private boolean acceptsNoCommercialResaleClause;

    private LocalDateTime submittedAt;
}
