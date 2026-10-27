package com.jivathunai.identity.dto;

import com.jivathunai.common.enums.SystemRole;
import java.util.Set;

public class AuthDto {

    public record RegisterRequest(
        String fullName,
        String email,
        String phone,
        String password,
        Set<SystemRole> requestedRoles,
        String addressLine,
        String city,
        String state,
        String pinCode
    ) {}

    public record LoginRequest(
        String identifier, // email or phone
        String password
    ) {}

    public record OtpVerificationRequest(
        String email,
        String otpCode
    ) {}

    public record AuthResponse(
        String token,
        Long userId,
        String fullName,
        String email,
        String phone,
        Set<String> roles,
        String kycStatus,
        boolean emailVerified
    ) {}

    public record ForgotPasswordRequest(
        String email
    ) {}

    public record ResetPasswordRequest(
        String email,
        String otpCode,
        String newPassword
    ) {}

    public record ResendOtpRequest(
        String email
    ) {}

    public record SendRegistrationOtpRequest(
        String fullName,
        String phone,
        String email
    ) {}

    public record VerifyRegistrationOtpRequest(
        String email,
        String otpCode
    ) {}

    public record CompleteRegistrationRequest(
        String fullName,
        String email,
        String phone,
        String password,
        String addressLine,
        String city,
        String district,
        String state,
        String pinCode,
        String country,
        String aadharNumber,
        Set<SystemRole> requestedRoles
    ) {}
}
