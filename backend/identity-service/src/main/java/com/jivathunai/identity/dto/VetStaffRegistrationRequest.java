package com.jivathunai.identity.dto;

public record VetStaffRegistrationRequest(
    String token,
    String email,
    String password,
    String aadhaarNumber,
    String personalPan,
    String vciRegistrationNumber
) {}
