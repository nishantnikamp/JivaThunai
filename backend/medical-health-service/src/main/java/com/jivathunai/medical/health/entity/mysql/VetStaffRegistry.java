package com.jivathunai.medical.health.entity.mysql;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "vet_staff_registry")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VetStaffRegistry {

    @Id
    @Column(name = "user_id", updatable = false, nullable = false)
    private UUID userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_organization_id", nullable = false)
    private VetOrganization parentOrganization;

    @Enumerated(EnumType.STRING)
    @Column(name = "assigned_system_role", nullable = false)
    private SystemRole assignedSystemRole;

    @Column(name = "aadhaar_number_hash")
    private String aadhaarNumberHash;

    @Column(name = "personal_pan", length = 10)
    private String personalPan;

    @Column(name = "vci_registration_number")
    private String vciRegistrationNumber;

    @Column(name = "doctor_name")
    private String doctorName;

    @Column(name = "specialization")
    private String specialization;

    @Enumerated(EnumType.STRING)
    @Column(name = "employment_status", nullable = false)
    private EmploymentStatus employmentStatus;

    public enum SystemRole {
        ROLE_VET_DOCTOR, ROLE_ASSISTANT_VET, ROLE_VET_STAFF
    }

    public enum EmploymentStatus {
        ACTIVE, SUSPENDED, TERMINATED
    }
}
