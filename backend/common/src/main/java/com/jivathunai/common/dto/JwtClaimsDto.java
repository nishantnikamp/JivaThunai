package com.jivathunai.common.dto;

import java.util.List;

public record JwtClaimsDto(
    Long userId,
    String email,
    String fullName,
    List<String> roles,
    String kycStatus,
    Long timestamp
) {}
