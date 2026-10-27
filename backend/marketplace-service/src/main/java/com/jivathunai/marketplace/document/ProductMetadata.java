package com.jivathunai.marketplace.document;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.*;
import java.util.List;

@Document(collection = "product_metadata")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ProductMetadata {
    @Id
    private String sku; // Maps to ProductCatalog SKU UUID
    
    private List<String> highResImageUrls;
    private List<String> instructionalVideoUrls;
    private List<String> safetyDataSheets;
    
    private String specifications;
    private List<String> ingredients;
    private List<String> allergenWarnings;
    private String manufacturingDate;
    private String expiryDate;
    
    private NutritionalProfile nutritionalProfile;
    private DosageProfile dosageProfile;

    @Data public static class NutritionalProfile {
        private Double crudeProteinPercent;
        private Double crudeFatPercent;
        private String dailyFeedingGuidelines;
    }
    @Data public static class DosageProfile {
        private List<String> activePharmaceuticalIngredients;
        private String dosageRulesPerKg;
        private String contraindications;
        private String emergencyOverdoseInstructions;
    }
}
