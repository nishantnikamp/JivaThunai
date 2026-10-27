package com.jivathunai.marketplace.controller;

import com.jivathunai.marketplace.dto.PetSaleDTO;
import com.jivathunai.marketplace.service.PetSaleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/pet")
@RequiredArgsConstructor

public class PetSaleController {

    private final PetSaleService petSaleService;
    private final com.jivathunai.marketplace.service.MarketplaceService marketplaceService;

    @PostMapping
    public ResponseEntity<PetSaleDTO> createListing(@RequestBody PetSaleDTO petSaleDTO) {
        return new ResponseEntity<>(petSaleService.createListing(petSaleDTO), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<PetSaleDTO>> getAllListings(
            @RequestParam(name = "breed", required = false) String breed,
            @RequestParam(name = "species", required = false) String species,
            @RequestParam(name = "minPrice", required = false) java.math.BigDecimal minPrice,
            @RequestParam(name = "maxPrice", required = false) java.math.BigDecimal maxPrice) {
        return ResponseEntity.ok(petSaleService.getAllListings(breed, species, minPrice, maxPrice));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PetSaleDTO> getListingById(@PathVariable("id") UUID id) {
        return petSaleService.getListingById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteListing(@PathVariable("id") UUID id) {
        petSaleService.deleteListing(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<PetSaleDTO> updateListing(@PathVariable("id") UUID id, @RequestBody PetSaleDTO petSaleDTO) {
        try {
            return ResponseEntity.ok(petSaleService.updateListing(id, petSaleDTO));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    @PostMapping("/checkout")
    public ResponseEntity<?> checkoutPets(@RequestBody com.jivathunai.marketplace.dto.CheckoutRequest req, @RequestHeader(value="X-User-Roles", defaultValue="") String roles) {
        try {
            boolean isVet = roles.contains("VETERINARY_DOCTOR") || roles.contains("VET");
            marketplaceService.checkoutPets(req, isVet);
            return ResponseEntity.ok("Pet Checkout successful, inventory updated.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
