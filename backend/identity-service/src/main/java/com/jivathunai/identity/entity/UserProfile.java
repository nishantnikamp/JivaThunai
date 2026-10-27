package com.jivathunai.identity.entity;

import com.jivathunai.identity.enums.KycStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "user_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 100)
    private String legalName;

    @Column(nullable = false, length = 15, unique = true)
    private String mobileNumber;

    @Column(nullable = false, length = 100, unique = true)
    private String email;

    @Column(columnDefinition = "TEXT")
    private String verifiedCurrentAddress;

    @Column(precision = 10)
    private Double latitude;

    @Column(precision = 10)
    private Double longitude;

    // KYC Fields
    @Column(length = 12, unique = true)
    private String aadhaarNumber;

    @Column(length = 10, unique = true)
    private String panNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private KycStatus kycStatus = KycStatus.PENDING;

    // Mapping to Household Evaluation
    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JoinColumn(name = "household_evaluation_id")
    private HouseholdEvaluation householdEvaluation;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
