package com.jivathunai.identity.dto;


import com.jivathunai.common.enums.SystemRole;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;

public record RegistrationRequest(
        @NotBlank(message = "Name cannot be blank")
        @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
        String name,

        @NotBlank(message = "Email is required")
        @Email(message = "Must be a valid email format")
        String email,

        @NotBlank(message = "Primary phone is required")
        @Pattern(regexp = "^\\+?[1-9]\\d{1,14}$", message = "Phone must match E.164 standard")
        String phonePrimary,

        @NotNull(message = "Date of birth is required")
        @Past(message = "DOB must be in the past")
        LocalDate dob,

        @NotBlank(message = "Gender is required")
        String gender,

        @NotBlank(message = "Password is required")
        @Size(min = 8, message = "Password must be at least 8 characters long")
        String password,

        @NotNull(message = "Address details are required")
        @Valid
        AddressDto address,

        @NotEmpty(message = "At least one role must be requested")
        Set<SystemRole> requestedRoles,

        @Valid
        List<RoleProfile> roleProfiles
) {}

 
