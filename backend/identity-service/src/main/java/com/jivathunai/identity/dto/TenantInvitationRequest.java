package com.jivathunai.identity.dto;

import com.jivathunai.common.enums.SystemRole;

public record TenantInvitationRequest(
    String email,
    String fullName,
    SystemRole targetRole,
    Long assignedDoctorId, // Optional, for ASSISTANT_VET_DOCTOR
    String specialty,
    String vciRegistrationNumber,
    String qualifications,
    String photoUrl
) {}
