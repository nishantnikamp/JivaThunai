package com.jivathunai.common.util;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.HexFormat;

public class CryptoUtils {

    private static final String SECRET_KEY = "JivaThunai-Secure-PetPassport-Cryptographic-SecretKey-2026";

    public static String generatePetQrHash(Long petId, Long ownerId, String microchipNumber) {
        try {
            String rawPayload = "PET:" + petId + "|OWNER:" + ownerId + "|CHIP:" + (microchipNumber != null ? microchipNumber : "NONE") + "|STAMP:" + System.currentTimeMillis();
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(SECRET_KEY.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKey);
            byte[] hmacBytes = mac.doFinal(rawPayload.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hmacBytes).substring(0, 32).toUpperCase();
        } catch (Exception e) {
            return "JIVA-" + petId + "-" + System.currentTimeMillis();
        }
    }
}
