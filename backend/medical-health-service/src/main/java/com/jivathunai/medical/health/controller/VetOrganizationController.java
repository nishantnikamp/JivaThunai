package com.jivathunai.medical.health.controller;

import com.jivathunai.common.response.ApiResponse;
import com.jivathunai.medical.health.dto.InviteStaffRequest;
import com.jivathunai.medical.health.dto.RegisterOrganizationRequest;
import com.jivathunai.medical.health.entity.mysql.VetOrganization;
import com.jivathunai.medical.health.entity.mysql.VetStaffRegistry;
import com.jivathunai.medical.health.service.VetOrganizationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/vet/org")
@RequiredArgsConstructor
@Slf4j
public class VetOrganizationController {

    private final VetOrganizationService organizationService;

    /**
     * Organization Registration Pipeline
     * Maps the DTO to VetOrganization (MySQL) and HospitalFacilityProfile (MongoDB).
     */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Map<String, Object>>> registerOrganization(@Valid @RequestBody RegisterOrganizationRequest request) {
        log.info("Registering veterinary hospital organization: {}", request.registeredBusinessName());
        Map<String, Object> result = organizationService.registerOrganization(request);
        return ResponseEntity.ok(ApiResponse.success("Tenant registered successfully. Waiting for KYC approval.", result));
    }

    /**
     * Staff Provisioning Gate
     * Provisions doctors, assistants, or staff for the parent hospital.
     */
    @PostMapping("/{orgId}/invite-staff")
    public ResponseEntity<ApiResponse<Map<String, Object>>> inviteStaff(
            @PathVariable UUID orgId,
            @Valid @RequestBody InviteStaffRequest request) {

        log.info("Inviting staff member to org ID: {}", orgId);
        Map<String, Object> result = organizationService.inviteStaff(orgId, request);
        return ResponseEntity.ok(ApiResponse.success("Staff provisioned / invite sent successfully", result));
    }

    /**
     * Legacy invite-staff endpoint for backward compatibility
     */
    @PostMapping("/invite-staff")
    public ResponseEntity<ApiResponse<Map<String, Object>>> legacyInviteStaff(
            @RequestParam(value = "orgId", required = false) UUID orgId,
            @Valid @RequestBody InviteStaffRequest request) {

        if (orgId == null) {
            throw new IllegalArgumentException("orgId parameter is required to invite staff to an organization.");
        }
        Map<String, Object> result = organizationService.inviteStaff(orgId, request);
        return ResponseEntity.ok(ApiResponse.success("Staff provisioned successfully", result));
    }

    /**
     * Get Complete Organization Details (MySQL + MongoDB)
     */
    @GetMapping("/{orgId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getOrganizationDetails(@PathVariable UUID orgId) {
        Map<String, Object> details = organizationService.getOrganizationDetails(orgId);
        return ResponseEntity.ok(ApiResponse.success("Organization profile retrieved", details));
    }

    /**
     * Get Hospital Staff Roster
     */
    @GetMapping("/{orgId}/staff")
    public ResponseEntity<ApiResponse<List<VetStaffRegistry>>> getOrganizationStaff(@PathVariable UUID orgId) {
        List<VetStaffRegistry> staffList = organizationService.getStaffByOrganization(orgId);
        return ResponseEntity.ok(ApiResponse.success("Staff roster retrieved", staffList));
    }

    /**
     * Remove Staff Member
     */
    @DeleteMapping("/{orgId}/staff/{userId}")
    public ResponseEntity<ApiResponse<String>> removeStaff(
            @PathVariable UUID orgId,
            @PathVariable UUID userId) {

        organizationService.removeStaff(orgId, userId);
        return ResponseEntity.ok(ApiResponse.success("Staff member removed from organization roster", "REMOVED"));
    }

    /**
     * Admin KYC Status Verification Update
     */
    @PatchMapping("/{orgId}/kyc-status")
    public ResponseEntity<ApiResponse<VetOrganization>> updateKycStatus(
            @PathVariable UUID orgId,
            @RequestParam VetOrganization.KycStatus status) {

        VetOrganization updated = organizationService.updateKycStatus(orgId, status);
        return ResponseEntity.ok(ApiResponse.success("Organization KYC status updated to " + status, updated));
    }
}
