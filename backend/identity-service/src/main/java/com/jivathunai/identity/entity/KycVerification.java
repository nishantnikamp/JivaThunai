package com.jivathunai.identity.entity;

import com.jivathunai.common.enums.KycStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "kyc_verifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KycVerification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    private String aadhaarNumberMasked;
    private String panNumber;
    private boolean selfieMatched;
    private Double faceMatchScore;

    // Commercial & Regulatory License fields under AWBI / Pet Shop Rules 2018 / Breeding Rules
    private String awbiRegistrationNumber;
    private String petShopLicenseNumber;
    private String breederLicenseNumber;
    private String vetCouncilRegistrationNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private KycStatus kycStatus;

    private String remarks;
    private LocalDateTime verifiedAt;
    private LocalDateTime createdAt;

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.kycStatus == null) {
            this.kycStatus = KycStatus.PENDING_VERIFICATION;
        }
    }
}
