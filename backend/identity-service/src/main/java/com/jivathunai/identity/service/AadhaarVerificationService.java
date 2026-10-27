package com.jivathunai.identity.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@Slf4j
public class AadhaarVerificationService {

    /**
     * Simulates the UIDAI Authentication API (Auth 2.5) for local testing.
     * In production, this would build the XML, sign it with a .p12 Keystore, 
     * encrypt the PID block with the UIDAI Public Key, and make an HTTP POST to the UIDAI AUA URL.
     *
     * @param aadharNumber The 12-digit Aadhaar number
     * @param fullName The name to match against Aadhaar (demographic auth)
     * @return AadhaarVerificationResult containing success status and UIDAI error codes
     */
    public AadhaarVerificationResult verifyAadhaar(String aadharNumber, String fullName) {
        log.info("Initiating simulated UIDAI Aadhaar Verification for UID ending in: {}", 
                 aadharNumber != null && aadharNumber.length() >= 4 ? aadharNumber.substring(aadharNumber.length() - 4) : "INVALID");
                 
        // Simulate UIDAI Sandbox network latency (1.5 seconds)
        try {
            Thread.sleep(1500);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        // Basic Verhoeff Algorithm / format validation (simplified to 12 digits for simulator)
        if (aadharNumber == null || !aadharNumber.matches("^\\d{12}$")) {
            return new AadhaarVerificationResult(false, "UID-111", "Invalid Aadhaar Number format. Must be 12 digits.");
        }

        // Simulator Logic based on Indian Gov Sandbox behavior:
        // Test numbers starting with '0000' will simulate a demographic mismatch.
        // Test numbers starting with '1111' will simulate a UIDAI server timeout.
        // All other 12-digit numbers will succeed as per Sandbox default behavior.
        if (aadharNumber.startsWith("0000")) {
            log.warn("Aadhaar Verification Failed: Demographic data did not match (Simulated).");
            return new AadhaarVerificationResult(false, "UID-300", "Demographic data (Name) did not match Aadhaar records.");
        }
        
        if (aadharNumber.startsWith("1111")) {
            log.error("Aadhaar Verification Failed: UIDAI Server Error (Simulated).");
            return new AadhaarVerificationResult(false, "UID-999", "Unknown error or timeout from UIDAI Auth Server.");
        }

        String txnId = "UKC:" + UUID.randomUUID().toString().substring(0, 10).toUpperCase();
        log.info("Aadhaar Verification Successful (Simulated). Auth Code: {}", txnId);
        
        return new AadhaarVerificationResult(true, "y", "Authentication Successful");
    }

    public record AadhaarVerificationResult(boolean success, String errCode, String message) {}
}
