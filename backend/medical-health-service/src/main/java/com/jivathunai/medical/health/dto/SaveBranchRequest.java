package com.jivathunai.medical.health.dto;

import lombok.Data;

@Data
public class SaveBranchRequest {
    private String branchId;
    private String branchName;
    private Boolean isMainBranch;
    private String streetAddress;
    private String city;
    private String district;
    private String stateName;
    private String country;
    private String pinCode;
    private Double latitude;
    private Double longitude;
    private String phone;
    private String email;
    private String directionsAndLandmarks;
    private String googleMapLink;
}
