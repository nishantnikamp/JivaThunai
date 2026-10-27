package com.jivathunai.adoption.document;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.*;
import java.util.List;

@Document(collection = "adoption_pet_metadata")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AdoptionPetMetadata {
    @Id
    private String id; // Maps to AdoptionListing UUID
    
    private MediaGallery media;
    private RescueFileDetails rescueDetails;
    private BehavioralMatrix behavior;

    @Data public static class MediaGallery {
        private List<String> photos;
        private List<String> videos;
        private List<String> documents; // AWBI Report, Vet Cert, Legal Deed
    }
    @Data public static class RescueFileDetails {
        private String geoCoordinates;
        private String spotDescription;
        private String initialRescueHealthState;
        private String rehabilitationHistory;
    }
    @Data public static class BehavioralMatrix {
        private Boolean houseTrained;
        private Integer kidFriendlyScale; // 1-5
        private Integer catFriendlyScale;
        private Integer dogFriendlyScale;
        private String biteRiskNotes;
        private String leashToleranceLevel;
        private String energyDescription;
    }
}
