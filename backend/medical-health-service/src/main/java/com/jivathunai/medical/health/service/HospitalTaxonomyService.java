package com.jivathunai.medical.health.service;

import com.jivathunai.medical.health.entity.mongo.HospitalTaxonomy;
import com.jivathunai.medical.health.entity.mongo.HospitalTaxonomy.TaxonomyItem;
import com.jivathunai.medical.health.repository.mongo.HospitalTaxonomyRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class HospitalTaxonomyService {

    private final HospitalTaxonomyRepository taxonomyRepository;

    public static final String CAT_ANIMAL_SPECIES = "ANIMAL_SPECIES";
    public static final String CAT_CONSULTATION_LANGUAGES = "CONSULTATION_LANGUAGES";
    public static final String CAT_PHOTO_CATEGORIES = "PHOTO_CATEGORIES";
    public static final String CAT_VIDEO_CATEGORIES = "VIDEO_CATEGORIES";
    public static final String CAT_EVIDENCE_TYPES = "EVIDENCE_TYPES";
    public static final String CAT_SERVICE_CATEGORIES = "SERVICE_CATEGORIES";
    public static final String CAT_UNIT_TYPES = "UNIT_TYPES";
    public static final String CAT_OPERATIONAL_STATUSES = "OPERATIONAL_STATUSES";
    public static final String CAT_TRIAGE_PRIORITIES = "TRIAGE_PRIORITIES";

    @PostConstruct
    public void initDefaultTaxonomies() {
        try {
            seedCategoryIfMissing(CAT_ANIMAL_SPECIES, "Animal Species", "Supported animal species & patients",
                    Arrays.asList(
                            new ItemSeed("DOGS", "Dogs", "🐕"),
                            new ItemSeed("CATS", "Cats", "🐈"),
                            new ItemSeed("BIRDS", "Birds", "🦜"),
                            new ItemSeed("RABBITS", "Rabbits", "🐇"),
                            new ItemSeed("HORSES", "Horses", "🐎"),
                            new ItemSeed("EXOTIC_PETS", "Exotic Pets", "🦎"),
                            new ItemSeed("SMALL_MAMMALS", "Small Mammals", "🐹"),
                            new ItemSeed("FARM_ANIMALS", "Farm Animals", "🐄"),
                            new ItemSeed("REPTILES", "Reptiles", "🐍"),
                            new ItemSeed("AQUATIC_PETS", "Aquatic & Fish", "🐠")
                    ));

            seedCategoryIfMissing(CAT_CONSULTATION_LANGUAGES, "Consultation Languages", "Primary consultation languages spoken by staff",
                    Arrays.asList(
                            new ItemSeed("ENGLISH", "English", "🌐"),
                            new ItemSeed("HINDI", "Hindi", "🌐"),
                            new ItemSeed("TELUGU", "Telugu", "🌐"),
                            new ItemSeed("TAMIL", "Tamil", "🌐"),
                            new ItemSeed("KANNADA", "Kannada", "🌐"),
                            new ItemSeed("MALAYALAM", "Malayalam", "🌐"),
                            new ItemSeed("MARATHI", "Marathi", "🌐"),
                            new ItemSeed("BENGALI", "Bengali", "🌐"),
                            new ItemSeed("GUJARATI", "Gujarati", "🌐"),
                            new ItemSeed("PUNJABI", "Punjabi", "🌐"),
                            new ItemSeed("URDU", "Urdu", "🌐"),
                            new ItemSeed("ODIA", "Odia", "🌐")
                    ));

            seedCategoryIfMissing(CAT_PHOTO_CATEGORIES, "Facility Photo Categories", "Hospital facility photo classification tags",
                    Arrays.asList(
                            new ItemSeed("EXTERIOR", "Exterior & Signage", "Building2"),
                            new ItemSeed("RECEPTION", "Reception & Waiting", "Armchair"),
                            new ItemSeed("CONSULTATION_ROOM", "Consultation Rooms", "Stethoscope"),
                            new ItemSeed("WARD", "Recovery Wards", "Bed"),
                            new ItemSeed("ICU", "ICU & Critical Care", "Activity"),
                            new ItemSeed("SURGERY", "Sterile Operation Theatre", "Scissors"),
                            new ItemSeed("LABORATORY", "Diagnostic Lab", "FlaskConical"),
                            new ItemSeed("EQUIPMENT", "Specialized Equipment", "Cpu"),
                            new ItemSeed("TEAM", "Clinical Team & Staff", "Users"),
                            new ItemSeed("PHARMACY", "Pharmacy Dispensing Area", "Pill"),
                            new ItemSeed("EMERGENCY_BAY", "Emergency Ambulance Bay", "Truck")
                    ));

            seedCategoryIfMissing(CAT_VIDEO_CATEGORIES, "Video Tour Categories", "Hospital video tours & walkthroughs tags",
                    Arrays.asList(
                            new ItemSeed("SERVICE_VIDEO", "Service Demonstration Video", "PlayCircle"),
                            new ItemSeed("CLINIC_TOUR", "Hospital Campus Tour", "Video"),
                            new ItemSeed("FACILITY_WALKTHROUGH", "Surgical & ICU Walkthrough", "Compass"),
                            new ItemSeed("SURGERY_DEMO", "Equipment & Safety Protocol", "Shield"),
                            new ItemSeed("EMERGENCY_DRILL", "Emergency Response Protocol", "AlertCircle")
                    ));

            seedCategoryIfMissing(CAT_EVIDENCE_TYPES, "Evidence & Proof Types", "Physical location evidence & document verification types",
                    Arrays.asList(
                            new ItemSeed("BUILDING_SIGNAGE", "Building Signage", "Board & Brand Exterior"),
                            new ItemSeed("ENTRANCE_PHOTO", "Entrance Photo", "Street View & Landmark"),
                            new ItemSeed("REGISTRATION_DOC_ADDRESS", "Registration Certificate", "Clinical Establishment Document"),
                            new ItemSeed("UTILITY_BILL", "Utility Bill", "Electricity / Water Address Proof"),
                            new ItemSeed("MUNICIPAL_TRADE_LICENSE", "Municipal Trade License", "Local Corporation NOC"),
                            new ItemSeed("BIOMEDICAL_WASTE_CERT", "Bio-Medical Waste Authorization", "State Pollution Board Certificate")
                    ));

            seedCategoryIfMissing(CAT_SERVICE_CATEGORIES, "Service Categories", "Clinical, surgical, and diagnostic service groups",
                    Arrays.asList(
                            new ItemSeed("CONSULTATION", "General / Specialist Consultation", "Outpatient clinical review"),
                            new ItemSeed("PREVENTIVE_CARE", "Preventive Care & Vaccines", "Immunizations, deworming & wellness"),
                            new ItemSeed("DIAGNOSTICS", "Diagnostics (X-Ray, Blood, Ultrasound)", "Imaging and pathology labs"),
                            new ItemSeed("SURGERY", "Surgery (General / Orthopaedic)", "Minor, major, and laparoscopic"),
                            new ItemSeed("EMERGENCY", "Emergency Stabilization & ICU", "24/7 critical resuscitation"),
                            new ItemSeed("INPATIENT_CARE", "Inpatient Hospitalization", "Multi-day medical monitoring"),
                            new ItemSeed("PHARMACY", "In-House Pharmacy", "Prescription veterinary medications"),
                            new ItemSeed("GROOMING", "Medical Grooming & Nutrition", "Therapeutic baths & diet planning"),
                            new ItemSeed("TELECONSULTATION", "Teleconsultation (Remote)", "Video & audio tele-triage"),
                            new ItemSeed("HOME_SERVICES", "Home Care & Mobile Visit", "At-home veterinarian visits"),
                            new ItemSeed("DENTAL_CARE", "Dental Care & Prophylaxis", "Scaling, extractions & oral hygiene"),
                            new ItemSeed("ONCOLOGY", "Oncology & Chemotherapy", "Cancer diagnostics & infusion care"),
                            new ItemSeed("PHYSIOTHERAPY", "Physiotherapy & Rehabilitation", "Laser therapy & mobility rehab")
                    ));

            seedCategoryIfMissing(CAT_UNIT_TYPES, "Facility Unit Types", "Hospital infrastructure and ward equipment classification",
                    Arrays.asList(
                            new ItemSeed("EMERGENCY_BED", "Emergency Trauma Ward Bed", "Bed"),
                            new ItemSeed("ICU_BED", "Intensive Care Unit (ICU) Bed", "Activity"),
                            new ItemSeed("OPERATION_THEATRE", "Sterile Operation Theatre Suite", "Scissors"),
                            new ItemSeed("CONSULTATION_ROOM", "Consultation & Examination Suite", "DoorClosed"),
                            new ItemSeed("DIAGNOSTIC_IMAGING", "Digital X-Ray / Ultrasound Suite", "Scan"),
                            new ItemSeed("PATHOLOGY_LAB", "In-House Pathology Laboratory", "FlaskConical"),
                            new ItemSeed("PHARMACY", "Pharmacy Dispensing Unit", "Pill"),
                            new ItemSeed("RECOVERY_WARD", "Recovery Ward Kennel / Enclosure", "Layers"),
                            new ItemSeed("ISOLATION_WARD", "Infectious Isolation Ward Bed", "ShieldAlert"),
                            new ItemSeed("CT_MRI_SUITE", "Advanced CT / MRI Imaging Suite", "Cpu")
                    ));

            seedCategoryIfMissing(CAT_OPERATIONAL_STATUSES, "Operational Statuses", "Capacity and operational state flags",
                    Arrays.asList(
                            new ItemSeed("OPERATIONAL", "OPERATIONAL", "Fully active and ready for patient intake"),
                            new ItemSeed("MAINTENANCE", "UNDER MAINTENANCE", "Routine technical or equipment check"),
                            new ItemSeed("CLEANING", "STERILIZING / CLEANING", "Terminal disinfection protocol"),
                            new ItemSeed("UNAVAILABLE", "TEMPORARILY UNAVAILABLE", "Off-line or undergoing renovation"),
                            new ItemSeed("EMERGENCY_RESERVED", "RESERVED FOR EMERGENCY", "Kept clear for incoming trauma cases")
                    ));

            seedCategoryIfMissing(CAT_TRIAGE_PRIORITIES, "Triage Severity Priority", "Clinical triage severity levels for emergency bed admissions",
                    Arrays.asList(
                            new ItemSeed("CRITICAL", "CRITICAL (Resuscitation / Immediate Trauma)", "Siren"),
                            new ItemSeed("EMERGENCY", "EMERGENCY (Severe Pain / Acute Hemorrhage)", "AlertTriangle"),
                            new ItemSeed("URGENT", "URGENT (Prompt Clinical Care Required)", "Clock"),
                            new ItemSeed("ROUTINE", "ROUTINE (Standard Clinical Admission)", "CheckCircle")
                    ));

            log.info("Initialized default hospital taxonomies in MongoDB successfully");
        } catch (Exception ex) {
            log.warn("Could not seed default hospital taxonomies: {}", ex.getMessage());
        }
    }

    private void seedCategoryIfMissing(String categoryId, String categoryName, String description, List<ItemSeed> seeds) {
        if (!taxonomyRepository.existsById(categoryId)) {
            List<TaxonomyItem> items = new ArrayList<>();
            LocalDateTime now = LocalDateTime.now();
            for (ItemSeed s : seeds) {
                items.add(TaxonomyItem.builder()
                        .code(s.code)
                        .label(s.label)
                        .description(s.description)
                        .icon(s.icon)
                        .isSystem(true)
                        .createdAt(now)
                        .build());
            }
            HospitalTaxonomy tax = HospitalTaxonomy.builder()
                    .id(categoryId)
                    .categoryName(categoryName)
                    .description(description)
                    .items(items)
                    .updatedAt(now)
                    .build();
            taxonomyRepository.save(tax);
        }
    }

    public Map<String, List<TaxonomyItem>> getAllTaxonomies() {
        if (!taxonomyRepository.existsById(CAT_TRIAGE_PRIORITIES)) {
            initDefaultTaxonomies();
        }
        Map<String, List<TaxonomyItem>> map = new LinkedHashMap<>();
        List<HospitalTaxonomy> all = taxonomyRepository.findAll();
        for (HospitalTaxonomy t : all) {
            map.put(t.getId(), t.getItems() != null ? t.getItems() : Collections.emptyList());
        }
        return map;
    }

    public List<TaxonomyItem> getTaxonomyItems(String categoryId) {
        if (CAT_TRIAGE_PRIORITIES.equalsIgnoreCase(categoryId) && !taxonomyRepository.existsById(CAT_TRIAGE_PRIORITIES)) {
            initDefaultTaxonomies();
        }
        return taxonomyRepository.findById(categoryId)
                .map(HospitalTaxonomy::getItems)
                .orElse(Collections.emptyList());
    }

    public synchronized TaxonomyItem addItem(String categoryId, String label, String code, String icon, String description, String userId) {
        if (label == null || label.trim().isEmpty()) {
            throw new IllegalArgumentException("Label cannot be empty");
        }
        String cleanLabel = label.trim();
        String cleanCode = (code != null && !code.trim().isEmpty())
                ? code.trim().toUpperCase().replaceAll("[^A-Z0-9_]+", "_")
                : cleanLabel.toUpperCase().replaceAll("[^A-Z0-9_]+", "_");

        HospitalTaxonomy tax = taxonomyRepository.findById(categoryId).orElseGet(() -> 
                HospitalTaxonomy.builder()
                        .id(categoryId)
                        .categoryName(categoryId.replace('_', ' '))
                        .description("Custom taxonomies for " + categoryId)
                        .items(new ArrayList<>())
                        .build()
        );

        if (tax.getItems() == null) {
            tax.setItems(new ArrayList<>());
        }

        // Check if item already exists (case-insensitive label or code)
        for (TaxonomyItem existing : tax.getItems()) {
            if (existing.getCode().equalsIgnoreCase(cleanCode) || existing.getLabel().equalsIgnoreCase(cleanLabel)) {
                return existing;
            }
        }

        TaxonomyItem newItem = TaxonomyItem.builder()
                .code(cleanCode)
                .label(cleanLabel)
                .description(description)
                .icon(icon)
                .isSystem(false)
                .addedBy(userId)
                .createdAt(LocalDateTime.now())
                .build();

        tax.getItems().add(newItem);
        tax.setUpdatedAt(LocalDateTime.now());
        taxonomyRepository.save(tax);
        log.info("Added new taxonomy item '{}' ({}) to category {}", cleanLabel, cleanCode, categoryId);

        return newItem;
    }

    private static class ItemSeed {
        String code;
        String label;
        String icon;
        String description;

        ItemSeed(String code, String label, String icon) {
            this.code = code;
            this.label = label;
            this.icon = icon;
            this.description = label;
        }
    }
}
