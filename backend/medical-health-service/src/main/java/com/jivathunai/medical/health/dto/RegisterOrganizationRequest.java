package com.jivathunai.medical.health.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.util.List;

public record RegisterOrganizationRequest(
    @NotBlank String registeredBusinessName,
    String gstin,
    String corporatePan,
    String clinicalEstablishmentActRegNumber,
    Boolean emergencySupport247,
    @NotBlank String primaryContactMobile,
    @NotBlank @Email String billingEmailAddress,
    @NotBlank String password,
    
    // Geospatial Data
    @NotBlank String streetAddress,
    @NotBlank String city,
    @NotBlank String district,
    @NotBlank String stateName,
    @NotBlank String country,
    @NotBlank String pinCode,
    String googleMapLink,
    Double latitude,
    Double longitude,
    String directionsAndLandmarks,

    // Infrastructure Checklist
    boolean inHousePharmacy,
    boolean icu,
    boolean xRayUnit,
    boolean pathologyLab,
    boolean bloodBank,
    List<String> otherAmenities
) {}
