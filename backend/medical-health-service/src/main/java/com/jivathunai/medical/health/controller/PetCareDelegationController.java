package com.jivathunai.medical.health.controller;

import com.jivathunai.common.response.ApiResponse;
import com.jivathunai.medical.health.dto.CreateDelegationRequest;
import com.jivathunai.medical.health.entity.mongo.PetCareDelegation;
import com.jivathunai.medical.health.service.PetCareDelegationService;
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
 * Temporary Pet Care Access REST Controller
 * Implements Innovation 3: Time-limited, least-privilege caretaker delegations.
 */
@RestController
@RequestMapping("/api/v1/medical/delegations")
@RequiredArgsConstructor
@Slf4j
public class PetCareDelegationController {

    private final PetCareDelegationService delegationService;

    private UUID toUuid(String val) {
        if (val == null || val.trim().isEmpty()) return UUID.randomUUID();
        try {
            return UUID.fromString(val.trim());
        } catch (IllegalArgumentException e) {
            return UUID.nameUUIDFromBytes(val.trim().getBytes(java.nio.charset.StandardCharsets.UTF_8));
        }
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PetCareDelegation>> createDelegation(
            @Valid @RequestBody CreateDelegationRequest request) {

        PetCareDelegation delegation = delegationService.createDelegation(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Temporary pet care delegation created successfully", delegation));
    }

    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<ApiResponse<List<PetCareDelegation>>> getDelegationsByOwner(@PathVariable String ownerId) {
        UUID ownerUuid = toUuid(ownerId);
        List<PetCareDelegation> list = delegationService.getDelegationsByOwner(ownerUuid);
        return ResponseEntity.ok(ApiResponse.success("Owner delegations retrieved", list));
    }

    @GetMapping("/caretaker")
    public ResponseEntity<ApiResponse<List<PetCareDelegation>>> getDelegationsForCaretaker(
            @RequestParam(value = "caretakerId", required = false) String caretakerId,
            @RequestParam(value = "email", required = false) String email) {

        UUID caretakerUuid = caretakerId != null ? toUuid(caretakerId) : null;
        List<PetCareDelegation> list = delegationService.getDelegationsForCaretaker(caretakerUuid, email);
        return ResponseEntity.ok(ApiResponse.success("Active caretaker delegations retrieved", list));
    }

    @GetMapping("/pet/{petId}")
    public ResponseEntity<ApiResponse<List<PetCareDelegation>>> getDelegationsByPet(@PathVariable String petId) {
        UUID petUuid = toUuid(petId);
        List<PetCareDelegation> list = delegationService.getDelegationsByPet(petUuid);
        return ResponseEntity.ok(ApiResponse.success("Pet delegations retrieved", list));
    }

    @PostMapping("/{delegationId}/revoke")
    public ResponseEntity<ApiResponse<PetCareDelegation>> revokeDelegation(
            @PathVariable String delegationId,
            @RequestBody(required = false) Map<String, String> payload,
            @RequestHeader(value = "X-User-Id", required = false) String requesterId) {

        UUID delUuid = toUuid(delegationId);
        UUID reqUuid = requesterId != null ? toUuid(requesterId) : UUID.randomUUID();
        String reason = payload != null ? payload.getOrDefault("reason", "Revoked by owner") : "Revoked by owner";

        PetCareDelegation revoked = delegationService.revokeDelegation(delUuid, reqUuid, reason);
        return ResponseEntity.ok(ApiResponse.success("Delegation revoked successfully", revoked));
    }

    @GetMapping("/{delegationId}/care-dashboard")
    public ResponseEntity<ApiResponse<PetCareDelegationService.CaretakerDashboardDto>> getCaretakerDashboard(
            @PathVariable String delegationId,
            @RequestHeader(value = "X-User-Id", required = false) String caretakerId) {

        UUID delUuid = toUuid(delegationId);
        UUID ctUuid = caretakerId != null ? toUuid(caretakerId) : UUID.randomUUID();

        try {
            PetCareDelegationService.CaretakerDashboardDto dashboard = delegationService.getCaretakerDashboard(delUuid, ctUuid);
            return ResponseEntity.ok(ApiResponse.success("Caretaker restricted dashboard loaded", dashboard));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error(e.getMessage()));
        }
    }
}
