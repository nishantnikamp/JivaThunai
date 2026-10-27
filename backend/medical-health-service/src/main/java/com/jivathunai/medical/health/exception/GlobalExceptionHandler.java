package com.jivathunai.medical.health.exception;

import com.jivathunai.common.response.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(AllergyConflictException.class)
    public ResponseEntity<ApiResponse<Map<String, Object>>> handleAllergyConflict(AllergyConflictException ex) {
        Map<String, Object> details = new HashMap<>();
        details.put("petName", ex.getPetName());
        details.put("conflictingMedicine", ex.getConflictingMedicine());
        details.put("matchedAllergen", ex.getMatchedAllergen());
        details.put("severity", ex.getSeverity());
        details.put("activeIngredients", ex.getActiveIngredients());
        details.put("clinicalWarning", "PRESCRIPTION_BLOCKED_DUE_TO_ALLERGEN_CONFLICT");

        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ApiResponse.success(ex.getMessage(), details));
    }

    @ExceptionHandler(BookingConflictException.class)
    public ResponseEntity<ApiResponse<Map<String, Object>>> handleBookingConflict(BookingConflictException ex) {
        Map<String, Object> details = new HashMap<>();
        if (ex.getDoctorId() != null) {
            details.put("doctorId", ex.getDoctorId());
        }
        if (ex.getRequestedDateTime() != null) {
            details.put("requestedDateTime", ex.getRequestedDateTime());
        }
        details.put("reason", ex.getReason());

        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ApiResponse.success(ex.getMessage(), details));
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleResourceNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(ex.getMessage()));
    }

    @ExceptionHandler(SecurityException.class)
    public ResponseEntity<ApiResponse<Void>> handleSecurityException(SecurityException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error("Security Violation: " + ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleValidationException(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error -> 
            errors.put(error.getField(), error.getDefaultMessage())
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.success("Validation failed", errors));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGenericException(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Internal Server Error: " + ex.getMessage()));
    }
}
