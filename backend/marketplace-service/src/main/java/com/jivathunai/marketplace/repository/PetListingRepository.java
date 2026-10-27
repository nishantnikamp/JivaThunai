package com.jivathunai.marketplace.repository;
import com.jivathunai.marketplace.entity.PetListing;
import org.springframework.data.jpa.repository.JpaRepository;
public interface PetListingRepository extends JpaRepository<PetListing, String> {}
