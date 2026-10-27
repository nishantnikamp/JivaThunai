package com.jivathunai.medical.health.entity.mysql;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "vet_organizations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VetOrganization {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID organizationId;

    @Column(name = "registered_business_name", nullable = false)
    private String registeredBusinessName;

    @Column(name = "gstin", length = 15)
    private String gstin;

    @Column(name = "corporate_pan", length = 10)
    private String corporatePan;

    @Column(name = "clinical_establishment_act_reg_number")
    private String clinicalEstablishmentActRegNumber;

    @Column(name = "emergency_support_24_7")
    private Boolean emergencySupport247;

    @Column(name = "primary_contact_mobile", nullable = false, length = 15)
    private String primaryContactMobile;

    @Column(name = "billing_email_address", nullable = false)
    private String billingEmailAddress;

    @Column(name = "address")
    private String address;

    @Column(name = "city")
    private String city;

    @Enumerated(EnumType.STRING)
    @Column(name = "kyc_status", nullable = false)
    private KycStatus kycStatus;

    public enum KycStatus {
        PENDING_VERIFICATION, APPROVED, REJECTED, REVOKED
    }
}
