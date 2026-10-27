package com.jivathunai.medical.health.entity.mongo;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Document(collection = "hospital_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HospitalProfileDocument {

    @Id
    private String id;

    @Indexed
    private UUID organizationId; // Maps to VetOrganization in MySQL

    @Indexed(unique = true)
    private String slug; // Public URL slug e.g. "upper-arlington-veterinary-hospital"

    private String hospitalName;
    private String displayName;
    private String hospitalType; // VETERINARY_HOSPITAL, CLINIC, SPECIALTY_CENTRE, MOBILE_SERVICE, EMERGENCY_CENTRE
    private String description;
    private String approachToCare;

    // Ownership & Contact
    private String legalEntityName;
    private String authorizedRepresentative;
    private String primaryPhone;
    private String emergencyPhone;
    private String billingEmail;
    private String publicEmail;
    private String websiteUrl;

    // Supported Scope
    @Builder.Default
    private List<String> languages = new ArrayList<>();
    
    @Builder.Default
    private List<String> animalTypes = new ArrayList<>(); // Dogs, Cats, Birds, Rabbits, Exotic, etc.

    // Registration & Licenses
    private String clinicalEstablishmentRegNumber;
    private String gstin;
    private String corporatePan;
    private String issuingAuthority;
    private String registrationExpiryDate;

    // Status & Completeness
    @Builder.Default
    private ProfileStatus status = ProfileStatus.DRAFT;
    
    @Builder.Default
    private Integer completenessScore = 35; // 0 to 100%

    private Boolean emergencySupport247;
    private String holidayExceptions;

    // Branding Media
    private String logoUrl;
    private String coverPhotoUrl;

    // Physical Headquarters & Main Branch Location
    private String streetAddress;
    private String city;
    private String district;
    private String stateName;
    private String country;
    private String pinCode;
    private Double latitude;
    private Double longitude;
    private String googleMapLink;
    private String directionsAndLandmarks;

    // Rich Nested Collections
    @Builder.Default
    private List<HospitalMedia> mediaList = new ArrayList<>();

    @Builder.Default
    private List<HospitalBranch> branches = new ArrayList<>();

    @Builder.Default
    private List<HospitalServiceItem> services = new ArrayList<>();

    @Builder.Default
    private List<HospitalFacilityItem> facilities = new ArrayList<>();

    @Builder.Default
    private List<DoctorProfileItem> doctors = new ArrayList<>();

    @Builder.Default
    private List<DayOpeningHour> openingHours = new ArrayList<>();

    @Builder.Default
    private List<HospitalDocumentItem> documents = new ArrayList<>();

    @Builder.Default
    private List<VerificationRecord> verificationRecords = new ArrayList<>();

    @Builder.Default
    private List<HospitalAuditLog> auditLogs = new ArrayList<>();

    private LocalDateTime lastPublishedAt;
    private LocalDateTime updatedAt;
    private LocalDateTime createdAt;

    public enum ProfileStatus {
        DRAFT,
        INCOMPLETE,
        SUBMITTED_FOR_REVIEW,
        CHANGES_REQUESTED,
        VERIFIED,
        PUBLISHED,
        SUSPENDED,
        ARCHIVED
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class HospitalMedia {
        private String mediaId;
        private String url;
        private String caption;
        private String category; // EXTERIOR, RECEPTION, CONSULTATION_ROOM, WARD, ICU, SURGERY, LABORATORY, EQUIPMENT, TEAM, SERVICE_VIDEO, OTHER
        private Boolean isPrimary;
        private Boolean isPublic;
        private String branchId;
        private String uploaderId;
        private String uploadDate;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class HospitalBranch {
        private String branchId;
        private String branchName;
        private Boolean isMainBranch;
        private String streetAddress;
        private String city;
        private String district;
        private String stateName;
        private String country;
        private String pinCode;
        private Double latitude;
        private Double longitude;
        private String phone;
        private String email;
        private String directionsAndLandmarks;
        private String googleMapLink;
        
        @Builder.Default
        private String locationVerificationStatus = "UNVERIFIED"; // UNVERIFIED, EVIDENCE_SUBMITTED, VERIFIED, REJECTED
        
        @Builder.Default
        private List<LocationEvidence> locationEvidenceList = new ArrayList<>();
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class LocationEvidence {
        private String evidenceId;
        private String evidenceType; // BUILDING_SIGNAGE, ENTRANCE_PHOTO, REGISTRATION_DOC_ADDRESS, UTILITY_BILL
        private String fileUrl;
        private String reviewStatus; // PENDING, APPROVED, REJECTED
        private String reviewerNotes;
        private String uploadedAt;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class HospitalServiceItem {
        private String serviceId;
        private String serviceName;
        private String category; // CONSULTATION, PREVENTIVE_CARE, DIAGNOSTICS, SURGERY, EMERGENCY, INPATIENT_CARE, PHARMACY, GROOMING, TELECONSULTATION, HOME_SERVICES
        private String description;
        
        @Builder.Default
        private List<String> supportedSpecies = new ArrayList<>();
        
        private String branchId;
        private Double price;
        private String priceRange; // e.g. "₹500 - ₹1,200"
        private String currency;
        private Double consultationFee;
        private Integer typicalDurationMinutes;
        private Boolean walkInSupported;
        private Boolean emergencySupported;
        private Boolean referralRequired;
        private String requiredEquipment;
        private Boolean published;
        private String verificationStatus; // UNVERIFIED, VERIFIED
        private String lastUpdated;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class HospitalFacilityItem {
        private String facilityId;
        private String facilityName;
        private String type; // EMERGENCY_BED, ICU_BED, CONSULTATION_ROOM, RECOVERY_WARD, OPERATION_THEATRE, DIAGNOSTIC_IMAGING, PATHOLOGY_LAB, PHARMACY, AMBULANCE, WAITING_AREA
        private String branchId;
        private Integer capacity;
        private String supportedProcedures;
        private String operationalStatus; // OPERATIONAL, MAINTENANCE, CLEANING, UNAVAILABLE
        private String lastInspectedDate;
        private String inspectionStatus; // PASSED, PENDING, EXPIRED
        private Boolean published;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DoctorProfileItem {
        private String doctorId;
        private String doctorName;
        private String qualifications; // B.V.Sc & A.H, M.V.Sc (Surgery)
        private String specialty;
        private String vciRegistrationNumber;
        private String licenseExpiryDate;
        
        @Builder.Default
        private List<String> speciesTreated = new ArrayList<>();
        
        @Builder.Default
        private List<String> languages = new ArrayList<>();
        
        private String branchId;
        private String verificationStatus; // PROFILE_COMPLETE, EVIDENCE_SUBMITTED, VERIFIED, ACTION_REQUIRED, SUSPENDED
        private String photoUrl;
        private String email;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DayOpeningHour {
        private String dayOfWeek; // MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY
        private Boolean isOpen;
        private String openTime; // "09:00"
        private String closeTime; // "20:00"
        private String breakStartTime; // "13:00"
        private String breakEndTime; // "14:00"
        private Boolean isEmergency24x7;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class HospitalDocumentItem {
        private String documentId;
        private String documentType; // CLINICAL_ESTABLISHMENT_ACT, GST_CERTIFICATE, PAN_CARD, POLLUTION_CONTROL, PHARMACY_LICENSE
        private String documentNumber;
        private String documentUrl;
        private String expiryDate;
        private String verificationStatus; // PENDING, VERIFIED, REJECTED, EXPIRED
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class VerificationRecord {
        private String recordId;
        private String reviewerId;
        private String reviewerName;
        private String decision; // APPROVED, CHANGES_REQUESTED, REJECTED
        private String scope; // FULL_PROFILE, LOCATION_ONLY, CREDENTIALS_ONLY
        private String notes;
        private String timestamp;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class HospitalAuditLog {
        private String logId;
        private String action; // CREATE, UPDATE_INFO, ADD_BRANCH, UPLOAD_MEDIA, ADD_SERVICE, VERIFY, PUBLISH, SUSPEND
        private String actorId;
        private String actorRole;
        private String details;
        private String timestamp;
    }
}
