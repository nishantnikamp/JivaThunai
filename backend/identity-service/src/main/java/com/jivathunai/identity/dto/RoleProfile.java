package com.jivathunai.identity.dto;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

@JsonTypeInfo(
        use = JsonTypeInfo.Id.NAME,
        include = JsonTypeInfo.As.PROPERTY,
        property = "profileType"
)
@JsonSubTypes({
        @JsonSubTypes.Type(value = ClinicDetails.class, name = "VETERINARY_DOCTOR"),
        @JsonSubTypes.Type(value = BusinessLicenseDetails.class, name = "COMMERCIAL"),
        @JsonSubTypes.Type(value = FacilityDetails.class, name = "CARETAKER")
})
public sealed interface RoleProfile permits ClinicDetails, BusinessLicenseDetails, FacilityDetails {}
