package com.jivathunai.identity.dto;
import lombok.Builder;
import lombok.Data;
import java.util.Set;
import com.jivathunai.common.enums.KycStatus;

@Data
@Builder
public class ProfileResponse {
    private Long id;
    private String email;
    private String phone;
    private String fullName;
    private String profilePhotoUrl;
    private String addressLine;
    private String city;
    private String state;
    private String pinCode;
    private KycStatus kycStatus;
    private Set<String> roles;
    private boolean clinicalLicenseUploaded;
    private boolean gstRegistrationUploaded;
}
