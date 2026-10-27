package com.jivathunai.identity.dto;

import com.jivathunai.common.enums.SystemRole;

public record UpdateStaffRequest(
    String fullName,
    String email,
    SystemRole role,
    String status,
    Long assignedDoctorId,
    String specialty,
    String vciRegistrationNumber,
    String qualifications,
    String photoUrl
) {}
