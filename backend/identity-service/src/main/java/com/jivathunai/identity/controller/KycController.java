package com.jivathunai.identity.controller;

import com.jivathunai.identity.service.KycValidationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/kyc")
@RequiredArgsConstructor
public class KycController {

    private final KycValidationService kycValidationService;

    @GetMapping("/verify-trade")
    public ResponseEntity<Boolean> verifyTrade(
            @RequestParam("buyerId") UUID buyerId,
            @RequestParam("sellerId") UUID sellerId) {
        
        boolean isAllowed = kycValidationService.verifyTradeCapability(buyerId, sellerId);
        if (isAllowed) {
            return ResponseEntity.ok(true);
        } else {
            return ResponseEntity.status(403).body(false); // 403 Forbidden
        }
    }

    @PostMapping("/onboard")
    public ResponseEntity<String> onboardUser(@RequestBody com.jivathunai.identity.dto.UserProfileDto userProfileDto) {
        kycValidationService.saveUserProfile(userProfileDto);
        return ResponseEntity.ok("Profile submitted for KYC verification successfully");
    }
}
