package com.jivathunai.identity.dto;

public record VerifyInviteRequest(
    String email,
    String token
) {}
