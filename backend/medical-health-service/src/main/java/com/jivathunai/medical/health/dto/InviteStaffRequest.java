package com.jivathunai.medical.health.dto;

import com.jivathunai.medical.health.entity.mysql.VetStaffRegistry.SystemRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record InviteStaffRequest(
    @NotBlank @Email String email,
    @NotBlank String fullName,
    @NotNull SystemRole role
) {}
