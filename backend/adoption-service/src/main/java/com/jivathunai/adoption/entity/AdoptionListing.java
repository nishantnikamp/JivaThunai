package com.jivathunai.adoption.entity;

import com.jivathunai.adoption.enums.Gender;
import com.jivathunai.adoption.enums.LifecycleStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "adoption_listings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdoptionListing {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID ngoOrShelterId;

    @Column(nullable = false, length = 100)
    private String petName;

    @Column(nullable = false, length = 50)
    private String species;

    @Column(length = 50)
    private String apparentBreed;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Gender gender;

    @Column(length = 50)
    private String estimatedAgeString;

    @Column(length = 100)
    private String animalBoardRegistrationRef;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private LifecycleStatus lifecycleStatus;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
