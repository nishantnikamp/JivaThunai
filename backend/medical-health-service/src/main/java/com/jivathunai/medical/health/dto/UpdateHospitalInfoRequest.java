package com.jivathunai.medical.health.dto;

import lombok.Data;
import java.util.List;

@Data
public class UpdateHospitalInfoRequest {
    private String hospitalName;
    private String displayName;
    private String hospitalType;
    private String description;
    private String approachToCare;
    private String legalEntityName;
    private String authorizedRepresentative;
    private String primaryPhone;
    private String emergencyPhone;
    private String billingEmail;
    private String publicEmail;
    private String websiteUrl;
    private List<String> languages;
    private List<String> animalTypes;
    private String clinicalEstablishmentRegNumber;
    private String gstin;
    private String corporatePan;
    private String issuingAuthority;
    private String registrationExpiryDate;
    private String logoUrl;
    private String coverPhotoUrl;
    private Boolean emergencySupport247;
    private String holidayExceptions;

    // Physical Headquarters & Main Branch Location
    private String streetAddress;
    private String city;
    private String district;
    private String stateName;
    private String country;
    private String pinCode;
    private Double latitude;
    private Double longitude;
    private String googleMapLink;
    private String directionsAndLandmarks;
}
