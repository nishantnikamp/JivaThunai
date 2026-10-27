package com.jivathunai.adoption.controller;
import com.jivathunai.adoption.entity.AdoptionListing;
import com.jivathunai.adoption.repository.AdoptionListingRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/adoptions")
@RequiredArgsConstructor
public class AdoptionController {
    private final AdoptionListingRepository repo;

    @GetMapping
    public ResponseEntity<List<AdoptionListing>> getAll() {
        return ResponseEntity.ok(repo.findAll());
    }

    @PostMapping
    public ResponseEntity<AdoptionListing> create(@RequestBody AdoptionListing listing, @RequestHeader(value="X-User-Roles", defaultValue="") String roles, @RequestHeader(value="X-User-Id", defaultValue="00000000-0000-0000-0000-000000000000") java.util.UUID userId) {
        if (!roles.contains("SUPER_ADMIN") && !roles.contains("NGO_SHELTER")) {
            return ResponseEntity.status(403).build();
        }
        listing.setNgoOrShelterId(userId);
        listing.setLifecycleStatus(com.jivathunai.adoption.enums.LifecycleStatus.AVAILABLE);
        return ResponseEntity.ok(repo.save(listing));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable java.util.UUID id, @RequestBody AdoptionListing updates, @RequestHeader(value="X-User-Roles", defaultValue="") String roles, @RequestHeader(value="X-User-Id", defaultValue="00000000-0000-0000-0000-000000000000") java.util.UUID userId) {
        Optional<AdoptionListing> opt = repo.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        AdoptionListing app = opt.get();
        if (!roles.contains("SUPER_ADMIN") && !app.getNgoOrShelterId().equals(userId)) {
            return ResponseEntity.status(403).build();
        }
        app.setPetName(updates.getPetName());
        app.setEstimatedAgeString(updates.getEstimatedAgeString());
        return ResponseEntity.ok(repo.save(app));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable java.util.UUID id, @RequestHeader(value="X-User-Roles", defaultValue="") String roles, @RequestHeader(value="X-User-Id", defaultValue="00000000-0000-0000-0000-000000000000") java.util.UUID userId) {
        Optional<AdoptionListing> opt = repo.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        if (!roles.contains("SUPER_ADMIN") && !opt.get().getNgoOrShelterId().equals(userId)) {
            return ResponseEntity.status(403).build();
        }
        repo.deleteById(id);
        return ResponseEntity.ok("Deleted");
    }

    @PostMapping("/{appId}/sign-agreement")
    public ResponseEntity<?> signAgreement(@PathVariable java.util.UUID appId, @RequestHeader(value="X-User-Roles", defaultValue="") String roles) {
        if (!roles.contains("SUPER_ADMIN") && !roles.contains("NGO_SHELTER")) {
            return ResponseEntity.status(403).body("Only NGO/Shelter or Admin can sign off on agreements.");
        }
        Optional<AdoptionListing> opt = repo.findById(appId);
        if (opt.isPresent()) {
            AdoptionListing app = opt.get();
            app.setLifecycleStatus(com.jivathunai.adoption.enums.LifecycleStatus.ADOPTED);
            repo.save(app);
            // Kafka logic would go here
        }
        return ResponseEntity.ok("Agreement signed and ownership transfer initiated.");
    }
}
