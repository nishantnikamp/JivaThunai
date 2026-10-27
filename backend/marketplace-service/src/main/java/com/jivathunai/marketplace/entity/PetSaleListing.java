package com.jivathunai.marketplace.entity;

import com.jivathunai.marketplace.enums.Gender;
import com.jivathunai.marketplace.enums.ListingStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "pet_sale_listings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PetSaleListing {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private Long sellerId;

    @Column(length = 15)
    private String gstin;

    @Column(length = 50)
    private String breederLicenseNumber;

    @Column(nullable = false, length = 50)
    private String species;

    @Column(length = 100)
    private String name;

    @Column(length = 50)
    private String breed;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Gender gender;

    @Column(nullable = false)
    private LocalDate dob;

    @Column(length = 50)
    private String baseCoatColor;

    @Column(length = 50)
    private String microchipNumber;

    @Column(length = 100)
    private String pedigreeCertificateRef;

    @Column(length = 100)
    private String location;

    @Column(length = 100)
    private String vendorName;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal askingPrice;

    @Column(nullable = false)
    private boolean negotiationAllowed;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ListingStatus status;
    
    @org.hibernate.annotations.Formula("(SELECT COALESCE(AVG(CAST(r.rating AS DOUBLE)), 0.0) FROM reviews r WHERE r.item_id = CAST(id AS VARCHAR))")
    @Builder.Default
    private Double rating = 0.0;
    
    @org.hibernate.annotations.Formula("(SELECT COUNT(r.id) FROM reviews r WHERE r.item_id = CAST(id AS VARCHAR))")
    @Builder.Default
    private Integer reviewCount = 0;

    @Transient
    private String countryOfOrigin;

    @Transient
    @Builder.Default
    private Boolean hasOffers = false;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
