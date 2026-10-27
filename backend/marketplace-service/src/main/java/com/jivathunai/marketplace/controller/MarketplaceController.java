package com.jivathunai.marketplace.controller;

import com.jivathunai.marketplace.entity.*;
import com.jivathunai.marketplace.repository.*;
import com.jivathunai.marketplace.service.MarketplaceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;

import java.util.*;

/**
 * Marketplace REST Controller
 */
@RestController
@RequestMapping("/api/v1/marketplace")
@RequiredArgsConstructor
public class MarketplaceController {

    private final MarketplaceService service;
    private final PetListingRepository petRepo;
    private final PetSaleListingRepository petSaleRepo;
    private final ProductCatalogRepository prodCatalogRepo;

    /**
     * Dynamic Database Endpoint: Fetch distinct Species, Breeds, Categories, Brands, and Locations
     */
    @GetMapping("/filter-options")
    public ResponseEntity<Map<String, Object>> getFilterOptions() {
        Set<String> species = new TreeSet<>(String.CASE_INSENSITIVE_ORDER);
        species.addAll(petSaleRepo.findDistinctSpecies());
        species.addAll(prodCatalogRepo.findDistinctTargetSpecies());

        Set<String> breeds = new TreeSet<>(String.CASE_INSENSITIVE_ORDER);
        breeds.addAll(petSaleRepo.findDistinctBreeds());

        Set<String> categories = new TreeSet<>(String.CASE_INSENSITIVE_ORDER);
        categories.addAll(prodCatalogRepo.findDistinctCategories());

        Set<String> brands = new TreeSet<>(String.CASE_INSENSITIVE_ORDER);
        brands.addAll(prodCatalogRepo.findDistinctBrands());

        Set<String> locations = new TreeSet<>(String.CASE_INSENSITIVE_ORDER);
        locations.addAll(petSaleRepo.findDistinctLocations());

        Map<String, Object> result = new HashMap<>();
        result.put("species", species);
        result.put("breeds", breeds);
        result.put("categories", categories);
        result.put("brands", brands);
        result.put("locations", locations);

        return ResponseEntity.ok(result);
    }

    // --- PETS CRUD ---
    @GetMapping("/pets")
    public ResponseEntity<List<PetListing>> getPets() {
        return ResponseEntity.ok(petRepo.findAll());
    }

    @PostMapping("/pets")
    public ResponseEntity<?> createPetListing(@RequestBody PetListing listing, @RequestHeader(value="X-User-Roles", defaultValue="") String roles, @RequestHeader(value="X-User-Id", defaultValue="1") Long userId) {
        if (!roles.contains("SELLER") && !roles.contains("BREEDER") && !roles.contains("SUPER_ADMIN")) {
            return ResponseEntity.status(403).body("Role not authorized to sell pets.");
        }
        listing.setSellerId(userId);
        return ResponseEntity.ok(service.publishPetListing(listing, true));
    }

    @PutMapping("/pets/{id}")
    public ResponseEntity<?> updatePetListing(@PathVariable("id") String id, @RequestBody PetListing updates, @RequestHeader(value="X-User-Roles", defaultValue="") String roles, @RequestHeader(value="X-User-Id", defaultValue="1") Long userId) {
        Optional<PetListing> opt = petRepo.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        PetListing existing = opt.get();
        
        if (!existing.getSellerId().equals(userId) && !roles.contains("SUPER_ADMIN")) {
            return ResponseEntity.status(403).body("Unauthorized to edit this listing.");
        }
        
        existing.setExactBreed(updates.getExactBreed());
        existing.setSpecies(updates.getSpecies());
        existing.setAskingPrice(updates.getAskingPrice());
        return ResponseEntity.ok(petRepo.save(existing));
    }

    @DeleteMapping("/pets/{id}")
    public ResponseEntity<?> deletePetListing(@PathVariable("id") String id, @RequestHeader(value="X-User-Roles", defaultValue="") String roles, @RequestHeader(value="X-User-Id", defaultValue="1") Long userId) {
        Optional<PetListing> opt = petRepo.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        if (!opt.get().getSellerId().equals(userId) && !roles.contains("SUPER_ADMIN") && !roles.contains("ADMIN")) {
            return ResponseEntity.status(403).body("Unauthorized.");
        }
        petRepo.deleteById(id);
        return ResponseEntity.ok("Deleted");
    }
}
