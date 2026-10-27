package com.jivathunai.medical.health.controller;

import com.jivathunai.common.response.ApiResponse;
import com.jivathunai.medical.health.dto.ScheduleProcedureRequest;
import com.jivathunai.medical.health.dto.UpdateDoctorStatusRequest;
import com.jivathunai.medical.health.dto.UpdateResourceStatusRequest;
import com.jivathunai.medical.health.entity.mongo.DoctorLiveStatus;
import com.jivathunai.medical.health.entity.mongo.HospitalResource;
import com.jivathunai.medical.health.entity.mongo.OTProcedure;
import com.jivathunai.medical.health.service.HospitalLiveOperationsService;
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
 * Hospital Live Operations & Resource Management REST Controller
 * Tracks Live Doctor Availability, Emergency Ward Beds, ICU Units, and Operation Theatres (OT).
 */
@RestController
@RequestMapping("/api/v1/medical/live-operations")
@RequiredArgsConstructor
@Slf4j
public class HospitalLiveOperationsController {

    private final HospitalLiveOperationsService operationsService;

    private UUID toUuid(String val) {
        if (val == null || val.trim().isEmpty()) return UUID.randomUUID();
        try {
            return UUID.fromString(val.trim());
        } catch (IllegalArgumentException e) {
            return UUID.nameUUIDFromBytes(val.trim().getBytes(java.nio.charset.StandardCharsets.UTF_8));
        }
    }

    private void assertHospitalStaffOrDoctor(String roles) {
        if (roles == null || roles.isBlank()) {
            throw new SecurityException("Unauthorized: Missing user authentication and roles");
        }
        boolean isAuthorized = roles.contains("ROLE_VET_DOCTOR") ||
                               roles.contains("ROLE_VET_ORGANIZATION") ||
                               roles.contains("VETERINARY_DOCTOR") ||
                               roles.contains("VETERINARY_ADMIN") ||
                               roles.contains("ROLE_VET_STAFF") ||
                               roles.contains("VET_STAFF") ||
                               roles.contains("ASSISTANT_VET_DOCTOR") ||
                               roles.contains("SUPER_ADMIN") ||
                               roles.contains("ADMIN");
        if (!isAuthorized) {
            throw new SecurityException("Forbidden: Only authorized veterinary staff, doctors, and hospital administrators can access live hospital operations");
        }
    }

    private void assertDoctorOrAdmin(String roles) {
        if (roles == null || roles.isBlank()) {
            throw new SecurityException("Unauthorized: Missing user authentication and roles");
        }
        boolean isAuthorized = roles.contains("ROLE_VET_DOCTOR") ||
                               roles.contains("ROLE_VET_ORGANIZATION") ||
                               roles.contains("VETERINARY_DOCTOR") ||
                               roles.contains("VETERINARY_ADMIN") ||
                               roles.contains("SUPER_ADMIN") ||
                               roles.contains("ADMIN");
        if (!isAuthorized) {
            throw new SecurityException("Forbidden: Only doctors or hospital duty administrators can perform clinical status changes");
        }
    }

    @GetMapping("/hospital/{hospitalId}")
    public ResponseEntity<ApiResponse<HospitalLiveOperationsService.HospitalOperationsSnapshot>> getHospitalSnapshot(
            @PathVariable String hospitalId,
            @RequestHeader(value = "X-User-Roles", required = false) String roles) {
        assertHospitalStaffOrDoctor(roles);
        UUID hUuid = toUuid(hospitalId);
        HospitalLiveOperationsService.HospitalOperationsSnapshot snapshot = operationsService.getHospitalSnapshot(hUuid);
        return ResponseEntity.ok(ApiResponse.success("Hospital live operational snapshot retrieved", snapshot));
    }

    @GetMapping("/doctors")
    public ResponseEntity<ApiResponse<List<DoctorLiveStatus>>> getAllDoctors(
            @RequestParam(value = "hospitalId", required = false) String hospitalId,
            @RequestHeader(value = "X-User-Roles", required = false) String roles) {
        assertHospitalStaffOrDoctor(roles);
        UUID hUuid = hospitalId != null ? toUuid(hospitalId) : null;
        List<DoctorLiveStatus> doctors = operationsService.getAllDoctorLiveStatuses(hUuid);
        return ResponseEntity.ok(ApiResponse.success("Doctor live operational statuses retrieved", doctors));
    }

    @PutMapping("/doctors/{doctorId}/status")
    public ResponseEntity<ApiResponse<DoctorLiveStatus>> updateDoctorStatus(
            @PathVariable String doctorId,
            @Valid @RequestBody UpdateDoctorStatusRequest request,
            @RequestHeader(value = "X-User-Roles", required = false) String roles) {

        assertDoctorOrAdmin(roles);
        UUID dUuid = toUuid(doctorId);
        DoctorLiveStatus updated = operationsService.updateDoctorStatus(dUuid, request);
        return ResponseEntity.ok(ApiResponse.success("Doctor live operational status updated to " + updated.getOperationalStatus(), updated));
    }

    @GetMapping("/resources")
    public ResponseEntity<ApiResponse<List<HospitalResource>>> getResources(
            @RequestParam(value = "hospitalId", required = false) String hospitalId,
            @RequestParam(value = "type", required = false) HospitalResource.ResourceType type,
            @RequestHeader(value = "X-User-Roles", required = false) String roles) {
        assertHospitalStaffOrDoctor(roles);
        UUID hUuid = hospitalId != null ? toUuid(hospitalId) : null;
        List<HospitalResource> resources = operationsService.getHospitalResources(hUuid, type);
        return ResponseEntity.ok(ApiResponse.success("Hospital resources retrieved", resources));
    }

    @PatchMapping("/resources/{resourceId}/status")
    public ResponseEntity<ApiResponse<HospitalResource>> updateResourceStatus(
            @PathVariable String resourceId,
            @Valid @RequestBody UpdateResourceStatusRequest request,
            @RequestHeader(value = "X-User-Roles", required = false) String roles) {

        assertHospitalStaffOrDoctor(roles);
        UUID rUuid = toUuid(resourceId);
        HospitalResource updated = operationsService.updateResourceStatus(rUuid, request);
        return ResponseEntity.ok(ApiResponse.success("Resource " + updated.getResourceCode() + " status updated to " + updated.getOperationalStatus(), updated));
    }

    @PostMapping("/ot-procedures")
    public ResponseEntity<ApiResponse<OTProcedure>> scheduleProcedure(
            @Valid @RequestBody ScheduleProcedureRequest request,
            @RequestHeader(value = "X-User-Roles", required = false) String roles) {

        assertDoctorOrAdmin(roles);
        try {
            OTProcedure procedure = operationsService.scheduleProcedure(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Operation Theatre procedure successfully scheduled", procedure));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/ot-procedures")
    public ResponseEntity<ApiResponse<List<OTProcedure>>> getProcedures(
            @RequestParam(value = "hospitalId", required = false) String hospitalId,
            @RequestHeader(value = "X-User-Roles", required = false) String roles) {
        assertHospitalStaffOrDoctor(roles);
        UUID hUuid = hospitalId != null ? toUuid(hospitalId) : null;
        List<OTProcedure> list = operationsService.getProceduresByHospital(hUuid);
        return ResponseEntity.ok(ApiResponse.success("Scheduled and active OT procedures retrieved", list));
    }

    @PatchMapping("/ot-procedures/{procedureId}/start")
    public ResponseEntity<ApiResponse<OTProcedure>> startProcedure(
            @PathVariable String procedureId,
            @RequestHeader(value = "X-User-Roles", required = false) String roles) {

        assertDoctorOrAdmin(roles);
        UUID pUuid = toUuid(procedureId);
        OTProcedure started = operationsService.startProcedure(pUuid);
        return ResponseEntity.ok(ApiResponse.success("Procedure started. OT room marked OCCUPIED and surgeon IN_SURGERY", started));
    }

    @PatchMapping("/ot-procedures/{procedureId}/complete")
    public ResponseEntity<ApiResponse<OTProcedure>> completeProcedure(
            @PathVariable String procedureId,
            @RequestBody(required = false) Map<String, String> payload,
            @RequestHeader(value = "X-User-Roles", required = false) String roles) {

        assertDoctorOrAdmin(roles);
        UUID pUuid = toUuid(procedureId);
        String notes = payload != null ? payload.get("postOpRecoveryPlan") : null;
        OTProcedure completed = operationsService.completeProcedure(pUuid, notes);
        return ResponseEntity.ok(ApiResponse.success("Procedure completed. OT room transitioned to CLEANING, surgeon released to AVAILABLE", completed));
    }
}
