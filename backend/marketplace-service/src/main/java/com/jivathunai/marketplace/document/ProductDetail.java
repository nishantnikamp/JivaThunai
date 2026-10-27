package com.jivathunai.marketplace.document;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Document(collection = "product_details")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductDetail {
    @Id
    private String id; // Matches Product.id (UUID string)

    private List<PhotoRecord> photos;
    private List<VideoRecord> videos;
    private List<DocumentRecord> documents;
    
    private ProductSpecifications specifications;
    private List<UserFeedbackRecord> userFeedback;
    
    private NutritionalAnalysis nutritionalAnalysis; // Food Specific
    private MedicalManifest medicalManifest; // Medicines Specific

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PhotoRecord {
        private String assetId;
        private String url;
        private String thumbnailUrl;
        private Boolean isPrimary;
        private LocalDateTime uploadedAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class VideoRecord {
        private String assetId;
        private String url;
        private String contentType;
        private BigDecimal durationSeconds;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DocumentRecord {
        private String documentId;
        private String documentType; // e.g., USER_MANUAL, SAFETY_DATA_SHEET, PRODUCT_WARRANTY
        private String fileUrl;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProductSpecifications {
        private String title;
        private String brand;
        private String description;
        private LocalDateTime manufacturingDate;
        private LocalDateTime expiryDate;
        private BigDecimal netWeightGrams;
        private PackageDimensions packageDimensions;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PackageDimensions {
        private BigDecimal length;
        private BigDecimal width;
        private BigDecimal height;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UserFeedbackRecord {
        private String reviewId;
        private String userId;
        private Integer starRating;
        private String commentText;
        private List<String> reviewPhotos;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class NutritionalAnalysis {
        private BigDecimal crudeProteinPercentage;
        private BigDecimal crudeFatPercentage;
        private BigDecimal crudeFiberPercentage;
        private List<String> ingredientsManifest;
        private Map<String, String> feedingGuidelinesTable; // e.g., mapping pet weight to daily portion size
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MedicalManifest {
        private Map<String, String> activePharmaceuticalIngredients; // Generic names and milligram values
        private BigDecimal dosagePerKgMetric;
        private String contraindicationsText;
        private String storageConditionInstructions;
    }
}
