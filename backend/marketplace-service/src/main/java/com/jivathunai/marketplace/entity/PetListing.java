package com.jivathunai.marketplace.entity;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "pet_listings")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PetListing {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    private Long sellerId;
    
    private String gstin;
    private String breederLicenseNumber;
    
    private String species;
    private String exactBreed;
    private String gender;
    private LocalDate dateOfBirth;
    private String baseCoatColor;
    
    private String microchipNumber;
    private String pedigreeRegNumber;
    
    private BigDecimal askingPrice;
    private Boolean negotiationAllowed;
    private String status; // UNDER_REVIEW, ACTIVE_AVAILABLE, ESCROW_HOLD, SOLD, REJECTED
    
    private LocalDateTime createdAt;
    private LocalDateTime lastModifiedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        lastModifiedAt = LocalDateTime.now();
    }
    @PreUpdate
    protected void onUpdate() {
        lastModifiedAt = LocalDateTime.now();
    }
}
