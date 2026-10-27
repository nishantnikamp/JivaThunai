package com.jivathunai.marketplace.service;

import com.jivathunai.marketplace.document.PetSaleMetadata;
import com.jivathunai.marketplace.dto.PetSaleDTO;
import com.jivathunai.marketplace.entity.PetSaleListing;
import com.jivathunai.marketplace.repository.PetSaleListingRepository;
import com.jivathunai.marketplace.repository.PetSaleMetadataRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PetSaleService {

    private final PetSaleListingRepository listingRepository;
    private final PetSaleMetadataRepository metadataRepository;

    @Transactional
    public PetSaleDTO createListing(PetSaleDTO petSaleDTO) {
        PetSaleListing savedListing = listingRepository.save(petSaleDTO.getListing());
        
        PetSaleMetadata metadata = petSaleDTO.getMetadata();
        if (metadata != null) {
            metadata.setListingId(savedListing.getId().toString());
            PetSaleMetadata savedMetadata = metadataRepository.save(metadata);
            return new PetSaleDTO(savedListing, savedMetadata);
        }
        
        return new PetSaleDTO(savedListing, null);
    }

    public List<PetSaleDTO> getAllListings(String breed, String species, java.math.BigDecimal minPrice, java.math.BigDecimal maxPrice) {
        List<PetSaleListing> listings;
        if (breed == null && species == null && minPrice == null && maxPrice == null) {
            listings = listingRepository.findAll();
        } else {
            String finalBreed = breed != null ? breed : "";
            String finalSpecies = species != null ? species : "";
            java.math.BigDecimal finalMin = minPrice != null ? minPrice : java.math.BigDecimal.ZERO;
            java.math.BigDecimal finalMax = maxPrice != null ? maxPrice : new java.math.BigDecimal("999999999.00");
            listings = listingRepository.findWithFilters(finalBreed, finalSpecies, finalMin, finalMax);
        }
        return listings.stream().map(listing -> {
            PetSaleMetadata metadata = metadataRepository.findByListingId(listing.getId().toString()).orElse(null);
            return new PetSaleDTO(listing, metadata);
        }).collect(Collectors.toList());
    }

    public Optional<PetSaleDTO> getListingById(UUID id) {
        return listingRepository.findById(id).map(listing -> {
            PetSaleMetadata metadata = metadataRepository.findByListingId(listing.getId().toString()).orElse(null);
            return new PetSaleDTO(listing, metadata);
        });
    }

    @Transactional
    public void deleteListing(UUID id) {
        listingRepository.deleteById(id);
        metadataRepository.findByListingId(id.toString()).ifPresent(metadataRepository::delete);
    }

    @Transactional
    public PetSaleDTO updateListing(UUID id, PetSaleDTO petSaleDTO) {
        PetSaleListing existingListing = listingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Listing not found"));
        
        // Update fields matching PetSaleListing.java
        PetSaleListing updateInfo = petSaleDTO.getListing();
        if (updateInfo != null) {
            existingListing.setName(updateInfo.getName());
            existingListing.setGstin(updateInfo.getGstin());
            existingListing.setBreederLicenseNumber(updateInfo.getBreederLicenseNumber());
            existingListing.setSpecies(updateInfo.getSpecies());
            existingListing.setBreed(updateInfo.getBreed());
            existingListing.setGender(updateInfo.getGender());
            existingListing.setDob(updateInfo.getDob());
            existingListing.setBaseCoatColor(updateInfo.getBaseCoatColor());
            existingListing.setMicrochipNumber(updateInfo.getMicrochipNumber());
            existingListing.setPedigreeCertificateRef(updateInfo.getPedigreeCertificateRef());
            existingListing.setLocation(updateInfo.getLocation());
            existingListing.setVendorName(updateInfo.getVendorName());
            existingListing.setAskingPrice(updateInfo.getAskingPrice());
            existingListing.setNegotiationAllowed(updateInfo.isNegotiationAllowed());
            existingListing.setStatus(updateInfo.getStatus());
        }

        PetSaleListing savedListing = listingRepository.save(existingListing);
        
        PetSaleMetadata existingMetadata = metadataRepository.findByListingId(id.toString()).orElse(null);
        PetSaleMetadata updateMetadata = petSaleDTO.getMetadata();
        
        if (updateMetadata != null) {
            if (existingMetadata == null) {
                existingMetadata = new PetSaleMetadata();
                existingMetadata.setListingId(id.toString());
            }
            // Update fields matching PetSaleMetadata.java
            existingMetadata.setPhotos(updateMetadata.getPhotos());
            existingMetadata.setVideos(updateMetadata.getVideos());
            existingMetadata.setDocuments(updateMetadata.getDocuments());
            existingMetadata.setLineageTracking(updateMetadata.getLineageTracking());
            existingMetadata.setHealthSummary(updateMetadata.getHealthSummary());
            
            PetSaleMetadata savedMetadata = metadataRepository.save(existingMetadata);
            return new PetSaleDTO(savedListing, savedMetadata);
        }

        return new PetSaleDTO(savedListing, existingMetadata);
    }
}
