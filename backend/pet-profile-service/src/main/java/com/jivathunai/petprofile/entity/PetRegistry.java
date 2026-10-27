package com.jivathunai.petprofile.entity;

import jakarta.persistence.*;
import lombok.*;

import java.sql.Timestamp;
import java.util.UUID;

@Entity
@Table(name = "pet_registry")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PetRegistry {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "pet_id", updatable = false, nullable = false)
    private UUID petId;

    @Column(name = "current_owner_id", nullable = false)
    private UUID currentOwnerId;

    @Column(name = "municipal_license_number")
    private String municipalLicenseNumber;

    @Column(name = "microchip_number", unique = true)
    private String microchipNumber;

    @Column(name = "registration_date")
    private Timestamp registrationDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private PetStatus status;

    public enum PetStatus {
        ACTIVE, TRANSFERRED, MISSING
    }
}
