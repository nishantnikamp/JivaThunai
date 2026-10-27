package com.jivathunai.identity.entity;

import com.jivathunai.common.enums.KycStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false, unique = true)
    private String phone;

    @Column(nullable = false)
    private String passwordHash;

    @Column(nullable = false)
    private String fullName;

    private String profilePhotoUrl;
    
    @Lob
    @Column(name = "profile_photo", columnDefinition = "LONGBLOB")
    private byte[] profilePhoto;
    
    private String addressLine;
    private String city;
    private String state;
    private String pinCode;

    @Lob
    @Column(name = "clinical_license", columnDefinition = "LONGBLOB")
    private byte[] clinicalLicense;

    @Lob
    @Column(name = "gst_registration", columnDefinition = "LONGBLOB")
    private byte[] gstRegistration;

    private String currentOtp;
    private LocalDateTime otpExpiry;
    private boolean emailVerified;
    private boolean phoneVerified;

    @Builder.Default
    private int otpResendCount = 0;
    private LocalDateTime lastOtpRequestTime;
    private LocalDateTime otpLockTime;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private KycStatus kycStatus = KycStatus.NOT_SUBMITTED;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "user_roles",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    @Builder.Default
    private Set<Role> roles = new HashSet<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_veterinary_doctor_id")
    private User assignedVeterinaryDoctor;

    @OneToMany(mappedBy = "assignedVeterinaryDoctor", fetch = FetchType.LAZY)
    @Builder.Default
    private Set<User> assistantDoctors = new HashSet<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_organization_id")
    private User parentOrganization;

    @OneToMany(mappedBy = "parentOrganization", fetch = FetchType.LAZY)
    @Builder.Default
    private Set<User> organizationStaff = new HashSet<>();

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
