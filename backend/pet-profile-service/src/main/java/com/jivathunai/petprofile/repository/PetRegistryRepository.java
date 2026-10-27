package com.jivathunai.petprofile.repository;

import com.jivathunai.petprofile.entity.PetRegistry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

import java.util.List;

@Repository
public interface PetRegistryRepository extends JpaRepository<PetRegistry, UUID> {
    List<PetRegistry> findByCurrentOwnerId(UUID currentOwnerId);
}
