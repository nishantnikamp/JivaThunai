package com.jivathunai.medical.health.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.util.List;

@Data
public class SaveDoctorProfileRequest {
    private String doctorId;
    @NotBlank(message = "Doctor name is required")
    private String doctorName;
    private String qualifications;
    private String specialty;
    @NotBlank(message = "Veterinary Council of India (VCI) registration number is mandatory")
    private String vciRegistrationNumber;
    private String licenseExpiryDate;
    private List<String> speciesTreated;
    private List<String> languages;
    private String branchId;
    private String photoUrl;
    private String email;
}
