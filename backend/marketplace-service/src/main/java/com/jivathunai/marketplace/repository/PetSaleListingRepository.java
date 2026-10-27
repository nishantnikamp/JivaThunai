package com.jivathunai.marketplace.repository;

import com.jivathunai.marketplace.entity.PetSaleListing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.util.List;

@Repository
public interface PetSaleListingRepository extends JpaRepository<PetSaleListing, UUID> {
    
    @Query("SELECT p FROM PetSaleListing p WHERE " +
           "(p.breed = :breed OR :breed = '') AND " +
           "(p.species = :species OR :species = '') AND " +
           "(p.askingPrice >= :minPrice) AND " +
           "(p.askingPrice <= :maxPrice)")
    List<PetSaleListing> findWithFilters(@Param("breed") String breed,
                                         @Param("species") String species,
                                         @Param("minPrice") BigDecimal minPrice,
                                         @Param("maxPrice") BigDecimal maxPrice);

    @Query("SELECT DISTINCT p.species FROM PetSaleListing p WHERE p.species IS NOT NULL AND p.species <> '' ORDER BY p.species ASC")
    List<String> findDistinctSpecies();

    @Query("SELECT DISTINCT p.breed FROM PetSaleListing p WHERE p.breed IS NOT NULL AND p.breed <> '' ORDER BY p.breed ASC")
    List<String> findDistinctBreeds();

    @Query("SELECT DISTINCT p.location FROM PetSaleListing p WHERE p.location IS NOT NULL AND p.location <> '' ORDER BY p.location ASC")
    List<String> findDistinctLocations();
}
