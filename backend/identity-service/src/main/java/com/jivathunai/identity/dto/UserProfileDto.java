package com.jivathunai.identity.dto;

import com.jivathunai.identity.enums.HomeType;
import com.jivathunai.identity.enums.OwnershipStatus;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserProfileDto {
    private String legalName;
    private String mobileNumber;
    private String email;
    private String verifiedCurrentAddress;
    private Double latitude;
    private Double longitude;
    private String aadhaarNumber;
    private String panNumber;

    // Household Evaluation
    private HomeType homeType;
    private OwnershipStatus ownershipStatus;
    private boolean landlordRwaPetAllowanceFlag;
    private String rwaNocDocumentPath;
    private String reasonToAdoptOrBuy;
}
