package com.jivathunai.medical.health.controller;

import com.jivathunai.common.response.ApiResponse;
import com.jivathunai.medical.health.dto.MissedCareActionRequest;
import com.jivathunai.medical.health.entity.mongo.MissedCareCase;
import com.jivathunai.medical.health.service.MissedCareService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Missed Care Detection & Follow-up REST Controller
 * Implements Innovation 2: Evaluate overdue care and coordinate actionable next steps.
 */
@RestController
@RequestMapping("/api/v1/medical/missed-care")
@RequiredArgsConstructor
@Slf4j
public class MissedCareController {

    private final MissedCareService missedCareService;

    private UUID toUuid(String val) {
        if (val == null || val.trim().isEmpty()) return UUID.randomUUID();
        try {
            return UUID.fromString(val.trim());
        } catch (IllegalArgumentException e) {
            return UUID.nameUUIDFromBytes(val.trim().getBytes(java.nio.charset.StandardCharsets.UTF_8));
        }
    }

    @PostMapping("/evaluate")
    public ResponseEntity<ApiResponse<List<MissedCareCase>>> runEvaluation() {
        List<MissedCareCase> detected = missedCareService.evaluateMissedCare();
        return ResponseEntity.ok(ApiResponse.success(
                "Missed-care evaluation completed. Detected/updated " + detected.size() + " overdue cases.",
                detected
        ));
    }

    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<ApiResponse<List<MissedCareCase>>> getCasesByOwner(@PathVariable String ownerId) {
        UUID ownerUuid = toUuid(ownerId);
        List<MissedCareCase> cases = missedCareService.getCasesByOwner(ownerUuid);
        return ResponseEntity.ok(ApiResponse.success("Missed-care cases retrieved for owner", cases));
    }

    @GetMapping("/pet/{petId}")
    public ResponseEntity<ApiResponse<List<MissedCareCase>>> getCasesByPet(@PathVariable String petId) {
        UUID petUuid = toUuid(petId);
        List<MissedCareCase> cases = missedCareService.getCasesByPet(petUuid);
        return ResponseEntity.ok(ApiResponse.success("Missed-care cases retrieved for pet", cases));
    }

    @GetMapping("/open")
    public ResponseEntity<ApiResponse<List<MissedCareCase>>> getOpenCases() {
        List<MissedCareCase> cases = missedCareService.getOpenCases();
        return ResponseEntity.ok(ApiResponse.success("Open missed-care cases retrieved", cases));
    }

    @PostMapping("/{caseId}/resolve")
    public ResponseEntity<ApiResponse<MissedCareCase>> resolveCase(
            @PathVariable String caseId,
            @RequestBody MissedCareActionRequest request) {

        UUID caseUuid = toUuid(caseId);
        MissedCareCase resolved = missedCareService.resolveCase(caseUuid, request);
        return ResponseEntity.ok(ApiResponse.success("Missed-care case resolved successfully", resolved));
    }
}
