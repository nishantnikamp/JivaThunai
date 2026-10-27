package com.jivathunai.medical.health.exception;

import lombok.Getter;
import java.util.List;

@Getter
public class AllergyConflictException extends RuntimeException {

    private final String petName;
    private final String conflictingMedicine;
    private final String matchedAllergen;
    private final String severity;
    private final List<String> activeIngredients;

    public AllergyConflictException(String petName, String conflictingMedicine, String matchedAllergen, String severity, List<String> activeIngredients) {
        super(String.format("CRITICAL ALLERGY CONFLICT: Prescription for '%s' contains active ingredient '%s' which conflicts with pet '%s' registered allergy '%s' (Severity: %s). Prescription writing blocked for patient safety.",
                conflictingMedicine, matchedAllergen, petName, matchedAllergen, severity));
        this.petName = petName;
        this.conflictingMedicine = conflictingMedicine;
        this.matchedAllergen = matchedAllergen;
        this.severity = severity;
        this.activeIngredients = activeIngredients;
    }
}
