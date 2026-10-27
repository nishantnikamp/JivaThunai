package com.jivathunai.marketplace.document;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.List;

@Document(collection = "pet_sale_metadata")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PetSaleMetadata {

    @Id
    private String id; // Matches PetSaleListing UUID

    @Indexed
    @Field("listing_id")
    private String listingId;

    @Field("photos")
    private List<Photo> photos;

    @Field("videos")
    private List<Video> videos;

    @Field("documents")
    private List<DocumentFile> documents;

    @Field("lineage_tracking")
    private LineageTracking lineageTracking;

    @Field("health_summary")
    private HealthSummary healthSummary;
}
