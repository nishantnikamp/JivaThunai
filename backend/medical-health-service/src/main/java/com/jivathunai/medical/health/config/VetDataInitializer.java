package com.jivathunai.medical.health.config;

import com.jivathunai.medical.health.repository.mongo.HospitalProfileRepository;
import com.jivathunai.medical.health.repository.mysql.VetOrganizationRepository;
import com.jivathunai.medical.health.repository.mysql.VetStaffRegistryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class VetDataInitializer implements CommandLineRunner {

    private final VetOrganizationRepository orgRepository;
    private final VetStaffRegistryRepository staffRepository;
    private final HospitalProfileRepository profileRepository;

    @Override
    public void run(String... args) {
        // Clean up previously seeded mock/dummy records or sync Karpagam Hospital & Research Center
        orgRepository.findAll().forEach(org -> {
            String name = org.getRegisteredBusinessName();
            if (name != null && (name.toLowerCase().contains("karpagam") || name.toLowerCase().contains("petcare"))) {
                org.setRegisteredBusinessName("Karpagam Hospital & Research Center");
                org.setPrimaryContactMobile("9876789564");
                org.setBillingEmailAddress("chauminsooshi@gmail.com");
                org.setAddress("Pollachi Main Rd, Ottakkalmandapam, Tamil Nadu 641032");
                org.setCity("Ottakkalmandapam");
                org.setEmergencySupport247(true);
                org.setKycStatus(com.jivathunai.medical.health.entity.mysql.VetOrganization.KycStatus.APPROVED);
                orgRepository.save(org);
                log.info("Synchronized unified 'Karpagam Hospital & Research Center' for org: {}", org.getOrganizationId());
            }
        });

        List<String> dummyNames = List.of(
                "Jiva Thunai Central Animal Hospital & Trauma Center",
                "Apollo Pet Care & Multispeciality Diagnostics",
                "Blue Cross Veterinary Care & Surgical Hospital",
                "Metro Pets 24/7 Emergency & Critical Care Clinic"
        );

        orgRepository.findAll().stream()
                .filter(org -> dummyNames.contains(org.getRegisteredBusinessName()))
                .forEach(org -> {
                    try {
                        staffRepository.findByParentOrganization_OrganizationId(org.getOrganizationId())
                                .forEach(staffRepository::delete);
                        orgRepository.delete(org);
                        log.info("Purged dummy hospital entry: {}", org.getRegisteredBusinessName());
                    } catch (Exception ex) {
                        log.warn("Could not delete dummy org: {}", org.getRegisteredBusinessName(), ex);
                    }
                });

        // Clean up mock MongoDB profiles with dummy UUID or demo slug
        try {
            profileRepository.findByOrganizationId(UUID.fromString("11111111-1111-1111-1111-111111111111"))
                    .ifPresent(profile -> {
                        profileRepository.delete(profile);
                        log.info("Purged dummy mock hospital profile with test organization UUID.");
                    });
            profileRepository.findBySlug("upper-arlington-veterinary-hospital")
                    .ifPresent(profile -> {
                        profileRepository.delete(profile);
                        log.info("Purged dummy demonstration hospital profile (upper-arlington).");
                    });
        } catch (Exception ex) {
            log.warn("Non-critical cleanup warning for dummy profile: {}", ex.getMessage());
        }

        log.info("Database loaded. System runs purely on real database records without mock seeders.");
    }
}
