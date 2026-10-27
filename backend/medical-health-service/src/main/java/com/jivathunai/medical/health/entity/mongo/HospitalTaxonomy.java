package com.jivathunai.medical.health.entity.mongo;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "hospital_taxonomies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HospitalTaxonomy {

    @Id
    private String id; // e.g. "ANIMAL_SPECIES", "CONSULTATION_LANGUAGES", "PHOTO_CATEGORIES", "VIDEO_CATEGORIES", "EVIDENCE_TYPES", "SERVICE_CATEGORIES", "UNIT_TYPES", "OPERATIONAL_STATUSES"

    private String categoryName;
    private String description;

    @Builder.Default
    private List<TaxonomyItem> items = new ArrayList<>();

    private LocalDateTime updatedAt;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TaxonomyItem {
        private String code;
        private String label;
        private String description;
        private String icon;
        private Boolean isSystem;
        private String addedBy;
        private LocalDateTime createdAt;
    }
}
