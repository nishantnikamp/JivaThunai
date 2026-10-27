package com.jivathunai.identity.controller;

import com.jivathunai.common.response.ApiResponse;
import com.jivathunai.identity.dto.AuthDto.ForgotPasswordRequest;
import com.jivathunai.identity.dto.AuthDto.LoginRequest;
import com.jivathunai.identity.dto.AuthDto.OtpVerificationRequest;
import com.jivathunai.identity.dto.AuthDto.ResendOtpRequest;
import com.jivathunai.identity.dto.AuthDto.ResetPasswordRequest;
import com.jivathunai.identity.dto.AuthDto.AuthResponse;
import com.jivathunai.identity.dto.AuthDto.CompleteRegistrationRequest;
import com.jivathunai.identity.dto.AuthDto.SendRegistrationOtpRequest;
import com.jivathunai.identity.dto.AuthDto.VerifyRegistrationOtpRequest;
import com.jivathunai.identity.dto.RegistrationRequest;
import com.jivathunai.identity.dto.RoleUpgradeRequest;
import com.jivathunai.identity.service.AuthService;
import com.jivathunai.identity.service.OnboardingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final OnboardingService onboardingService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<String>> register(@Valid @RequestBody RegistrationRequest request) {
        onboardingService.registerPolymorphic(request);
        return ResponseEntity.ok(ApiResponse.success("Registration successful. Verification OTP sent.", null));
    }

    @PostMapping("/send-registration-otp")
    public ResponseEntity<ApiResponse<String>> sendRegistrationOtp(@RequestBody SendRegistrationOtpRequest request) {
        authService.sendRegistrationOtp(request);
        return ResponseEntity.ok(ApiResponse.success("Registration OTP sent to email.", null));
    }

    @PostMapping("/verify-registration-otp")
    public ResponseEntity<ApiResponse<Boolean>> verifyRegistrationOtp(@RequestBody VerifyRegistrationOtpRequest request) {
        boolean success = authService.verifyRegistrationOtp(request);
        if (success) {
            return ResponseEntity.ok(ApiResponse.success("OTP verified.", true));
        } else {
            return ResponseEntity.badRequest().body(ApiResponse.error("Invalid OTP."));
        }
    }

    @PostMapping("/complete-registration")
    public ResponseEntity<ApiResponse<AuthResponse>> completeRegistration(@RequestBody CompleteRegistrationRequest request) {
        AuthResponse response = authService.completeRegistration(request);
        return ResponseEntity.ok(ApiResponse.success("Registration completed successfully.", response));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<Boolean>> verifyOtp(@RequestBody OtpVerificationRequest request) {
        boolean success = authService.verifyOtp(request);
        if (success) {
            return ResponseEntity.ok(ApiResponse.success("OTP verified successfully.", true));
        } else {
            return ResponseEntity.badRequest().body(ApiResponse.error("Invalid or expired OTP."));
        }
    }

    @PostMapping("/validate-otp")
    public ResponseEntity<ApiResponse<Boolean>> validateOtp(@RequestBody OtpVerificationRequest request) {
        boolean success = authService.validateOtp(request);
        if (success) {
            return ResponseEntity.ok(ApiResponse.success("OTP is valid.", true));
        } else {
            return ResponseEntity.badRequest().body(ApiResponse.error("Invalid or expired OTP."));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful.", response));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<String>> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ResponseEntity.ok(ApiResponse.success("OTP sent to your email.", null));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<String>> resetPassword(@RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.success("Password reset successfully. You can now login.", null));
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<ApiResponse<String>> resendOtp(@RequestBody ResendOtpRequest request) {
        authService.resendOtp(request);
        return ResponseEntity.ok(ApiResponse.success("A new OTP has been sent.", null));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<String>> logout() {
        return ResponseEntity.ok(ApiResponse.success("Logged out successfully.", null));
    }

    @PostMapping("/upgrade-role")
    public ResponseEntity<ApiResponse<String>> upgradeRole(@RequestHeader("Authorization") String token, @Valid @RequestBody RoleUpgradeRequest request) {
        // In a real app, extract userId from JWT token. For now, assuming a mock user ID of 1 for demonstration, or we can pass it if needed.
        // Assuming the auth service or security context handles it. 
        // For demonstration, we'll hardcode user ID 1 or extract it if we have a utility.
        // In this implementation, we simulate an authenticated user upgrading their role:
        Long userId = 1L; // Mock extraction
        onboardingService.upgradeRole(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Role upgrade application submitted successfully. Pending admin review.", null));
    }
}
