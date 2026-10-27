package com.jivathunai.identity.entity;

import com.jivathunai.identity.enums.HomeType;
import com.jivathunai.identity.enums.OwnershipStatus;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "household_evaluations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HouseholdEvaluation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private HomeType homeType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private OwnershipStatus ownershipStatus;

    @Column(nullable = false)
    private boolean landlordRwaPetAllowanceFlag;

    @Column(length = 255)
    private String rwaNocDocumentPath;

    @Column(columnDefinition = "TEXT")
    private String reasonToAdoptOrBuy;
}
