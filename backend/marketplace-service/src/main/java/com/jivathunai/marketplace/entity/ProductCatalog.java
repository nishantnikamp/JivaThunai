package com.jivathunai.marketplace.entity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonProperty;

@Entity
@Table(name = "product_catalog")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ProductCatalog {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private String sku;
    
    private Long merchantId;
    private String name; // Keeping name for convenience
    private String categoryId;
    
    @JsonProperty("targetSpeciesId")
    private String targetSpecies;
    
    private BigDecimal retailPrice;
    private BigDecimal discountedActivePrice;
    
    @JsonProperty("platformCommissionSplitRate")
    private BigDecimal platformCommissionSplit;
    
    @JsonProperty("activeStockQuantityCount")
    private Integer activeStockQuantity;
    
    @JsonProperty("lowStockAlertBoundary")
    private Integer lowStockBoundary;
    
    @JsonProperty("requiresPrescriptionFlag")
    private Boolean requiresPrescription;
    
    @JsonProperty("isActiveFlag")
    private Boolean activeVisibility;
    
    @org.hibernate.annotations.Formula("(SELECT COALESCE(AVG(CAST(r.rating AS DOUBLE)), 0.0) FROM reviews r WHERE r.item_id = sku)")
    @Builder.Default
    private Double rating = 0.0;
    
    @org.hibernate.annotations.Formula("(SELECT COUNT(r.id) FROM reviews r WHERE r.item_id = sku)")
    @Builder.Default
    private Integer reviewCount = 0;

    @Transient
    private String countryOfOrigin;

    @Transient
    @Builder.Default
    private Boolean hasOffers = false;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String brand;
    
    @Column(columnDefinition = "TEXT")
    private String photoUrl;

    @ElementCollection
    private List<String> photos;

    @ElementCollection
    private List<String> videos;

    // Additional fields for complete edit/update support
    private String barcode;
    
    private BigDecimal baseCostPrice;
    
    @JsonProperty("gstPercentageRate")
    private BigDecimal gstPercentageRate;
    
    @JsonProperty("maximumOrderQuantityLimit")
    private Integer maximumOrderQuantityLimit;
    
    @JsonProperty("isScheduledDrugFlag")
    private Boolean isScheduledDrugFlag;
    
    private String manufacturingDate;
    private String expiryDate;
    
    private BigDecimal netWeightGrams;
    private BigDecimal length;
    private BigDecimal width;
    private BigDecimal height;

    // Food Specific
    private BigDecimal crudeProteinPercentage;
    private BigDecimal crudeFatPercentage;
    private BigDecimal crudeFiberPercentage;
    
    @Column(columnDefinition = "TEXT")
    private String ingredientsManifest;
    
    // Medicine Specific
    private BigDecimal dosagePerKgMetric;
    
    @Column(columnDefinition = "TEXT")
    private String contraindicationsText;
    
    @Column(columnDefinition = "TEXT")
    private String storageConditionInstructions;
    
    // For APIs (dynamic array), we can map to a JSON string or ElementCollection.
    // Given Jackson compatibility with List of Maps or custom objects, we can use a generic type or simply ignore it if it's too complex for basic entity.
    // Let's use a String to store raw JSON for APIs or ignore it for now since it's a dynamic array of objects.
    // Wait, let's just add it as a transient or basic list if possible. We can store it as JSON String.
    
    @Column(columnDefinition = "TEXT")
    private String apisJson; // A helper field if needed, but since frontend sends `apis: [...]`, we need a class.

    @ElementCollection
    private List<ApiDetail> apis;
    
    @Embeddable
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class ApiDetail {
        private String name;
        private String mg;
    }
}
