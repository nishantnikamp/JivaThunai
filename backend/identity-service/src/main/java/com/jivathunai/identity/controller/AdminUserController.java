package com.jivathunai.identity.controller;

import com.jivathunai.common.response.ApiResponse;
import com.jivathunai.identity.service.AdminUserService;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final AdminUserService adminUserService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<Map<String, Object>>>> getAllUsers(
            @RequestParam(name = "page", defaultValue = "1") int page,
            @RequestParam(name = "size", defaultValue = "20") int size,
            @RequestParam(name = "search", required = false) String search,
            @RequestParam(name = "role", required = false) String role) {
        // In a real app, ensure this is protected by @PreAuthorize("hasRole('SUPER_ADMIN')")
        Page<Map<String, Object>> users = adminUserService.getAllUsers(page, size, search, role);
        return ResponseEntity.ok(ApiResponse.success("Users fetched successfully", users));
    }

    @PutMapping("/{userId}/roles")
    public ResponseEntity<ApiResponse<String>> updateUserRoles(
            @PathVariable("userId") Long userId,
            @RequestBody List<String> roles) {
        // In a real app, ensure this is protected by @PreAuthorize("hasRole('SUPER_ADMIN')")
        adminUserService.updateUserRoles(userId, roles);
        return ResponseEntity.ok(ApiResponse.success("User roles updated successfully", null));
    }

    @PutMapping("/{userId}/kyc-status")
    public ResponseEntity<ApiResponse<String>> updateUserKycStatus(
            @PathVariable("userId") Long userId,
            @RequestParam("status") com.jivathunai.common.enums.KycStatus status) {
        adminUserService.updateUserKycStatus(userId, status);
        return ResponseEntity.ok(ApiResponse.success("Hospital verification / KYC status updated to " + status, status.name()));
    }

    @PutMapping("/{userId}")
    public ResponseEntity<ApiResponse<String>> updateUserDetails(
            @PathVariable("userId") Long userId,
            @RequestBody Map<String, Object> updates) {
        adminUserService.updateUser(userId, updates);
        return ResponseEntity.ok(ApiResponse.success("User details updated successfully", null));
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<ApiResponse<String>> deleteUser(@PathVariable("userId") Long userId) {
        adminUserService.deleteUser(userId);
        return ResponseEntity.ok(ApiResponse.success("User deleted successfully", null));
    }

    @GetMapping("/metrics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboardMetrics() {
        return ResponseEntity.ok(ApiResponse.success("Metrics fetched", adminUserService.getDashboardMetrics()));
    }

    @GetMapping("/settings/verification-mode")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> getVerificationMode() {
        String value = adminUserService.getSystemSetting("VERIFICATION_MODE", "MANUAL");
        return ResponseEntity.ok(ApiResponse.success("Setting fetched", Map.of("autoVerify", "AUTO".equals(value))));
    }

    @PutMapping("/settings/verification-mode")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> updateVerificationMode(@RequestBody Map<String, Boolean> request) {
        boolean autoVerify = request.getOrDefault("autoVerify", false);
        adminUserService.updateSystemSetting("VERIFICATION_MODE", autoVerify ? "AUTO" : "MANUAL");
        return ResponseEntity.ok(ApiResponse.success("Setting updated", Map.of("autoVerify", autoVerify)));
    }
}
