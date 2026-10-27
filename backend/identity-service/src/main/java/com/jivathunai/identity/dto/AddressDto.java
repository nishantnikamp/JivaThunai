package com.jivathunai.identity.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record AddressDto(
        @NotBlank(message = "Address line cannot be blank") String addressLine,
        @NotBlank(message = "City cannot be blank") String city,
        @NotBlank(message = "State cannot be blank") String state,
        @NotBlank(message = "Pincode is required")
        @Pattern(regexp = "^[1-9][0-9]{5}$", message = "Invalid Indian pincode format")
        String pinCode
) {}
