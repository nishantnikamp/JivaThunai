package com.jivathunai.identity.controller;

import com.jivathunai.common.response.ApiResponse;
import com.jivathunai.identity.dto.TenantInvitationRequest;
import com.jivathunai.identity.service.TenantInvitationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/invitations")
@RequiredArgsConstructor
public class TenantInvitationController {

    private final TenantInvitationService tenantInvitationService;

    @PostMapping("/{adminId}/invite")
    public ResponseEntity<ApiResponse<String>> createInvitation(
            @PathVariable("adminId") Long adminId,
            @RequestBody TenantInvitationRequest request) {
        try {
            String token = tenantInvitationService.createInvitation(adminId, request);
            return ResponseEntity.ok(ApiResponse.success("Invitation sent successfully", token));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(ApiResponse.error("Failed to send invitation: " + e.getMessage()));
        }
    }

    @GetMapping("/{adminId}/staff")
    public ResponseEntity<ApiResponse<java.util.List<com.jivathunai.identity.dto.StaffMemberDto>>> getStaff(
            @PathVariable("adminId") Long adminId) {
        try {
            java.util.List<com.jivathunai.identity.dto.StaffMemberDto> staff = tenantInvitationService.getStaff(adminId);
            return ResponseEntity.ok(ApiResponse.success("Staff fetched successfully", staff));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Failed to fetch staff: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{adminId}/staff/{staffId}")
    public ResponseEntity<ApiResponse<String>> removeStaff(
            @PathVariable("adminId") Long adminId,
            @PathVariable("staffId") Long staffId,
            @RequestParam("status") String status) {
        try {
            tenantInvitationService.removeStaff(adminId, staffId, status);
            return ResponseEntity.ok(ApiResponse.success("Staff removed successfully", null));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(ApiResponse.error("Failed to remove staff: " + e.getMessage()));
        }
    }

    @PutMapping("/{adminId}/staff/{staffId}")
    public ResponseEntity<ApiResponse<String>> updateStaff(
            @PathVariable("adminId") Long adminId,
            @PathVariable("staffId") Long staffId,
            @RequestBody com.jivathunai.identity.dto.UpdateStaffRequest request) {
        try {
            tenantInvitationService.updateStaff(adminId, staffId, request);
            return ResponseEntity.ok(ApiResponse.success("Staff updated successfully", null));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(ApiResponse.error("Failed to update staff: " + e.getMessage()));
        }
    }
    @PostMapping("/verify-code")
    public ResponseEntity<ApiResponse<java.util.Map<String, Object>>> verifyInviteCode(@RequestBody com.jivathunai.identity.dto.VerifyInviteRequest request) {
        try {
            java.util.Map<String, Object> inviteDetails = tenantInvitationService.verifyInviteCode(request.email(), request.token());
            return ResponseEntity.ok(ApiResponse.success("Invite verified successfully", inviteDetails));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<com.jivathunai.identity.dto.AuthDto.AuthResponse>> registerStaff(@RequestBody com.jivathunai.identity.dto.VetStaffRegistrationRequest request) {
        try {
            com.jivathunai.identity.dto.AuthDto.AuthResponse response = tenantInvitationService.registerStaff(request);
            return ResponseEntity.ok(ApiResponse.success("Registration successful", response));
        } catch (Exception e) {
            e.printStackTrace();
            String errorMsg = e.getMessage();
            if (errorMsg == null || errorMsg.trim().isEmpty()) {
                errorMsg = "Server Error: " + e.getClass().getSimpleName();
            }
            return ResponseEntity.status(400).body(ApiResponse.error(errorMsg));
        }
    }
}
