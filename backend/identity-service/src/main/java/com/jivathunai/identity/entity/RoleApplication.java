package com.jivathunai.identity.entity;

import com.jivathunai.common.enums.SystemRole;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "role_applications")
@Getter
@Setter
public class RoleApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "requested_role", nullable = false)
    private SystemRole requestedRole;

    @Column(name = "application_status", nullable = false)
    private String applicationStatus; // PENDING_APPROVAL, APPROVED, REJECTED

    // JSON Payload of the submitted conditional profile (ClinicDetails, BusinessLicenseDetails, etc.)
    @Column(name = "conditional_profile_payload", columnDefinition = "JSON")
    private String conditionalProfilePayload;

    @Column(name = "admin_remarks")
    private String adminRemarks;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;
}
