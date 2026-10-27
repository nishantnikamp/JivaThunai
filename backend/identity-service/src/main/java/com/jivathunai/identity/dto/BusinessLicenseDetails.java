package com.jivathunai.identity.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record BusinessLicenseDetails(
        @NotBlank(message = "AWBI Registration Number is required")
        String awbiRegistrationNumber,

        String petShopLicenseUrl,
        String breederLicenseUrl,

        @Pattern(regexp = "^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$", message = "Invalid GSTIN format")
        String gstin,

        @NotBlank(message = "Bank account document URL is required")
        @Pattern(regexp = "^(https?://).*$", message = "Must be a valid secure URL")
        String bankRecordsUrl
) implements RoleProfile {}
