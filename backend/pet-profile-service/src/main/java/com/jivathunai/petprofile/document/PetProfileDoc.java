package com.jivathunai.petprofile.document;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Date;
import java.util.List;
import java.util.UUID;

/**
 * Pet Profile MongoDB Document
 */
@Document(collection = "pet_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PetProfileDoc {

    @Id
    private UUID petId;

    private BasicProfile basicProfile;
    private MediaGallery mediaGallery;
    private qrProfileMetadata qrProfileMetadata;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BasicProfile {
        private String name;
        private String species;
        private String breed;
        private Gender gender;
        private Date dateOfBirth;
        private String baseColor;
        private Double weightKg;
        private Double heightCm;
        private String identifyingMarks;
        private String description;
        private String microchipNumber;
    }

    public enum Gender {
        MALE, FEMALE, UNKNOWN
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MediaGallery {
        private List<Photo> photos;
        private List<Video> videos;
        private List<ProfileDocument> documents;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Photo {
        private String assetId;
        private String url;
        private String thumbnailUrl;
        private boolean isPrimary;
        private Date uploadedAt;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Video {
        private String assetId;
        private String url;
        private String contentType;
        private Double durationSeconds;
        private Date uploadedAt;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProfileDocument {
        private String docId;
        private DocumentType documentType;
        private String certificateNumber;
        private String secureS3Key;
        private boolean isVerifiedByAdmin;
        private Date uploadedAt;
    }

    public enum DocumentType {
        BREED_CERTIFICATE, HEALTH_CERTIFICATE, MUNICIPAL_LICENSE
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class qrProfileMetadata {
        private String qrCodePayloadString;
        private boolean isActive;
        private String publicProfileUrl;
        private EmergencyContactOverride emergencyContactOverride;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class EmergencyContactOverride {
        private String name;
        private String phone;
        private String bloodGroup;
    }

    private ProfileVisibility profileVisibility;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProfileVisibility {
        @com.fasterxml.jackson.annotation.JsonProperty("isPublic")
        @org.springframework.data.mongodb.core.mapping.Field("isPublic")
        @Builder.Default
        private boolean isPublic = false;

        @com.fasterxml.jackson.annotation.JsonProperty("showPhysicalAttributes")
        @Builder.Default
        private boolean showPhysicalAttributes = true;

        @com.fasterxml.jackson.annotation.JsonProperty("showCertificates")
        @Builder.Default
        private boolean showCertificates = true;

        @com.fasterxml.jackson.annotation.JsonProperty("showMedia")
        @Builder.Default
        private boolean showMedia = true;

        @com.fasterxml.jackson.annotation.JsonProperty("showMedicalRecords")
        @Builder.Default
        private boolean showMedicalRecords = true;

        @com.fasterxml.jackson.annotation.JsonSetter("public")
        public void setAltPublic(Boolean altPublic) {
            if (altPublic != null) {
                this.isPublic = altPublic;
            }
        }

        @com.fasterxml.jackson.annotation.JsonSetter("isPublic")
        public void setIsPublic(Boolean isPublic) {
            if (isPublic != null) {
                this.isPublic = isPublic;
            }
        }
    }
}
