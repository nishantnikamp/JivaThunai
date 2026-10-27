package com.jivathunai.petprofile.entity;

import jakarta.persistence.*;
import lombok.*;
import java.sql.Timestamp;
import java.util.UUID;

@Entity
@Table(name = "ownership_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OwnershipHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "pet_id", nullable = false)
    private UUID petId;

    @Column(name = "previous_owner_id")
    private UUID previousOwnerId;

    @Column(name = "new_owner_id", nullable = false)
    private UUID newOwnerId;

    @Column(name = "transfer_date")
    private Timestamp transferDate;

    @Column(name = "legal_agreement_url")
    private String legalAgreementUrl;
}
