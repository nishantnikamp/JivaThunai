package com.jivathunai.identity.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record FacilityDetails(
        @NotBlank(message = "Housing type is required")
        String housingType,

        @Min(value = 100, message = "Facility must be at least 100 sq ft")
        int squareFeet,

        @NotBlank(message = "RWA NOC URL is required")
        @Pattern(regexp = "^(https?://).*$", message = "Must be a valid secure URL")
        String rwaNocUrl
) implements RoleProfile {}
