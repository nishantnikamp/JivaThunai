package com.jivathunai.marketplace.document;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.*;
import java.util.List;

@Document(collection = "pet_listing_metadata")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PetListingMetadata {
    @Id
    private String id; // Maps to PetListing MySQL UUID
    
    private List<MediaAsset> photoGallery;
    private List<MediaAsset> videoGallery;
    private List<VerificationDocument> documents;
    private LineageTracking lineage;
    private HealthSummary healthSummary;

    @Data public static class MediaAsset {
        private String url;
        private String thumbnailUrl;
        private Boolean primaryDisplay;
        private String contentType;
        private Integer durationSeconds;
        private String timestampUploaded;
    }
    @Data public static class VerificationDocument {
        private String documentId;
        private String documentType; // PEDIGREE, MUNICIPAL, VACCINATION, HEALTH
        private String securePdfUrl;
        private String verificationStatus; // PENDING, APPROVED, REJECTED
    }
    @Data public static class LineageTracking {
        private String sireDetails;
        private String damDetails;
        private List<String> championTitles;
        private String breederHealthNotes;
    }
    @Data public static class HealthSummary {
        private List<String> dewormingTracker;
        private List<String> activeImmunizations;
        private String knownAllergies;
    }
}
