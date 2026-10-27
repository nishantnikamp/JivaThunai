package com.jivathunai.marketplace.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "product_id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "sku_code", unique = true, nullable = false)
    private String skuCode;

    @Column(name = "gtin_barcode")
    private String barcode;

    @Column(name = "merchant_id", nullable = false)
    private UUID merchantId;

    @Column(name = "category_id", nullable = false)
    private Long categoryId;

    @Column(name = "target_species_id")
    private Long targetSpeciesId;

    @Column(name = "breed_applicability_name")
    private String breedApplicabilityName;

    @Column(name = "location", length = 100)
    private String location;

    @Column(name = "vendor_name", length = 100)
    private String vendorName;

    @Column(name = "base_cost_price", precision = 10, scale = 2)
    private BigDecimal baseCostPrice;

    @Column(name = "retail_price_mrp", nullable = false, precision = 10, scale = 2)
    private BigDecimal retailPrice;

    @Column(name = "discounted_active_price", precision = 10, scale = 2)
    private BigDecimal discountedActivePrice;

    @Column(name = "gst_percentage_rate", precision = 5, scale = 2)
    private BigDecimal gstPercentageRate;

    @Column(name = "platform_commission_split_rate", precision = 5, scale = 2)
    private BigDecimal platformCommissionSplitRate;

    @Column(name = "active_stock_quantity_count", nullable = false)
    private Integer activeStockQuantityCount;

    @Column(name = "low_stock_alert_boundary")
    private Integer lowStockAlertBoundary;

    @Column(name = "maximum_order_quantity_limit")
    private Integer maximumOrderQuantityLimit;

    @Column(name = "average_rating_score", precision = 3, scale = 2)
    private BigDecimal averageRatingScore;

    @Column(name = "like_save_count")
    private Integer likeSaveCount;

    @Column(name = "requires_prescription_flag", nullable = false)
    private boolean requiresPrescriptionFlag;

    @Column(name = "is_scheduled_drug_flag", nullable = false)
    private boolean isScheduledDrugFlag;

    @Column(name = "is_active_flag", nullable = false)
    private boolean isActiveFlag;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
