package com.jivathunai.medical.health.controller;

import com.jivathunai.common.response.ApiResponse;
import com.jivathunai.medical.health.dto.CompleteCareTaskRequest;
import com.jivathunai.medical.health.dto.CreateCarePlanRequest;
import com.jivathunai.medical.health.entity.mongo.PetCarePlan;
import com.jivathunai.medical.health.service.CarePlanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Care Continuity & Next-Care Planning REST Controller
 * Implements Innovation 1: Structured care plans & next-care tasks.
 */
@RestController
@RequestMapping("/api/v1/medical/care-plans")
@RequiredArgsConstructor
@Slf4j
public class CarePlanController {

    private final CarePlanService carePlanService;

    private UUID toUuid(String val) {
        if (val == null || val.trim().isEmpty()) return UUID.randomUUID();
        try {
            return UUID.fromString(val.trim());
        } catch (IllegalArgumentException e) {
            return UUID.nameUUIDFromBytes(val.trim().getBytes(java.nio.charset.StandardCharsets.UTF_8));
        }
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PetCarePlan>> createCarePlan(
            @Valid @RequestBody CreateCarePlanRequest request,
            @RequestHeader(value = "X-User-Roles", required = false, defaultValue = "ROLE_VET_DOCTOR") String roles) {

        // RBAC: Doctors, Hospital Admins, and Veterinary Staff can create clinical treatment care plans
        boolean isAuthorized = roles == null || roles.isBlank() ||
                               roles.contains("ROLE_VET_DOCTOR") ||
                               roles.contains("ROLE_VET_ORGANIZATION") ||
                               roles.contains("VETERINARY_DOCTOR") ||
                               roles.contains("VETERINARY_ADMIN") ||
                               roles.contains("ROLE_VET_STAFF") ||
                               roles.contains("VET_STAFF") ||
                               roles.contains("ASSISTANT_VET_DOCTOR") ||
                               roles.contains("SUPER_ADMIN") ||
                               roles.contains("ADMIN");

        if (!isAuthorized) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Only licensed veterinarians, hospital staff, or administrators can create clinical care plans."));
        }

        try {
            PetCarePlan plan = carePlanService.createCarePlan(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Pet Care Plan successfully generated and scheduled", plan));
        } catch (Exception ex) {
            log.error("Error creating pet care plan: {}", ex.getMessage(), ex);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Failed to create pet care plan: " + ex.getMessage()));
        }
    }

    @GetMapping("/pet/{petId}")
    public ResponseEntity<ApiResponse<List<PetCarePlan>>> getCarePlansByPet(@PathVariable String petId) {
        UUID petUuid = toUuid(petId);
        List<PetCarePlan> plans = carePlanService.getCarePlansByPet(petUuid);
        return ResponseEntity.ok(ApiResponse.success("Care plans retrieved for pet", plans));
    }

    @GetMapping("/pet/{petId}/active")
    public ResponseEntity<ApiResponse<PetCarePlan>> getActiveCarePlan(@PathVariable String petId) {
        UUID petUuid = toUuid(petId);
        return carePlanService.getActiveCarePlan(petUuid)
                .map(p -> ResponseEntity.ok(ApiResponse.success("Active care plan retrieved", p)))
                .orElseGet(() -> ResponseEntity.ok(ApiResponse.success("No active care plan found", null)));
    }

    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<ApiResponse<List<PetCarePlan>>> getCarePlansByOwner(@PathVariable String ownerId) {
        UUID ownerUuid = toUuid(ownerId);
        List<PetCarePlan> plans = carePlanService.getCarePlansByOwner(ownerUuid);
        return ResponseEntity.ok(ApiResponse.success("Owner pet care plans retrieved", plans));
    }

    @PatchMapping("/{planId}/tasks/{taskId}/complete")
    public ResponseEntity<ApiResponse<PetCarePlan>> completeCareTask(
            @PathVariable String planId,
            @PathVariable String taskId,
            @RequestBody CompleteCareTaskRequest request) {

        UUID taskUuid = toUuid(taskId);
        PetCarePlan updated = carePlanService.completeCareTask(planId, taskUuid, request);
        return ResponseEntity.ok(ApiResponse.success("Care task marked as completed", updated));
    }

    @PatchMapping("/{planId}/tasks/{taskId}/cancel")
    public ResponseEntity<ApiResponse<PetCarePlan>> cancelCareTask(
            @PathVariable String planId,
            @PathVariable String taskId,
            @RequestBody Map<String, String> payload) {

        UUID taskUuid = toUuid(taskId);
        String reason = payload.getOrDefault("reason", "Cancelled by user");
        PetCarePlan updated = carePlanService.cancelCareTask(planId, taskUuid, reason);
        return ResponseEntity.ok(ApiResponse.success("Care task cancelled", updated));
    }
}
