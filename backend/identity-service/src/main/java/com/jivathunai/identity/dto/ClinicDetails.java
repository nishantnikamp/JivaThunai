package com.jivathunai.identity.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record ClinicDetails(
        @NotBlank(message = "VCI Number is required for veterinarians")
        String vciNumber,

        @NotBlank(message = "State Council Certificate URL is required")
        @Pattern(regexp = "^(https?://).*$", message = "Must be a valid secure URL")
        String stateCouncilCertificateUrl,

        boolean emergencyAvailability
) implements RoleProfile {}
