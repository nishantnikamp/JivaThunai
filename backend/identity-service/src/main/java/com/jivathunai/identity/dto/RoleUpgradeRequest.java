package com.jivathunai.identity.dto;

import com.jivathunai.common.enums.SystemRole;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

public record RoleUpgradeRequest(
        @NotNull(message = "Requested role is required")
        SystemRole requestedRole,

        @Valid
        RoleProfile roleProfile
) {}
