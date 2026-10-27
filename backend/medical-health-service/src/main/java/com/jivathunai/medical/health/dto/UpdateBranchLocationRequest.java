package com.jivathunai.medical.health.dto;

import lombok.Data;

@Data
public class UpdateBranchLocationRequest {
    private Double latitude;
    private Double longitude;
    private String streetAddress;
    private String city;
    private String district;
    private String stateName;
    private String pinCode;
    private String googleMapLink;
    private String directionsAndLandmarks;
}
