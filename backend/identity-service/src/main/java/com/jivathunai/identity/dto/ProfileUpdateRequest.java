package com.jivathunai.identity.dto;
import lombok.Data;

@Data
public class ProfileUpdateRequest {
    private String fullName;
    private String phone;
    private String profilePhotoUrl;
    private String addressLine;
    private String city;
    private String state;
    private String pinCode;
}
