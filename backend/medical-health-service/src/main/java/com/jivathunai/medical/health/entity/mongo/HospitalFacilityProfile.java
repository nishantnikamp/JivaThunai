package com.jivathunai.medical.health.entity.mongo;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.*;
import java.util.List;
import java.util.UUID;

@Document(collection = "hospital_facility_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HospitalFacilityProfile {

    @Id
    private String id;

    private UUID organizationId; // Maps to VetOrganization in MySQL

    private Address addressGeospatial;

    private List<String> facilityMedia; // URLs for photos, videos, corporate IDs

    private InfrastructureChecklist infrastructureChecklist;

    private List<String> verificationLogs;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Address {
        private String streetAddress;
        private String city;
        private String district;
        private String stateName;
        private String country;
        private String pinCode;
        private String googleMapLink;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class InfrastructureChecklist {
        private boolean inHousePharmacy;
        private boolean icu;
        private boolean xRayUnit;
        private boolean pathologyLab;
        private boolean bloodBank;
        private List<String> otherAmenities;
    }
}
