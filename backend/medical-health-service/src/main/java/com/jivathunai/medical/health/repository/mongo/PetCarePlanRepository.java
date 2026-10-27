package com.jivathunai.medical.health.repository.mongo;

import com.jivathunai.medical.health.entity.mongo.PetCarePlan;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PetCarePlanRepository extends MongoRepository<PetCarePlan, String> {
    List<PetCarePlan> findByPetIdOrderByCreatedAtDesc(UUID petId);
    Optional<PetCarePlan> findFirstByPetIdAndStatus(UUID petId, PetCarePlan.PlanStatus status);
    List<PetCarePlan> findByOwnerIdOrderByCreatedAtDesc(UUID ownerId);
    List<PetCarePlan> findByStatus(PetCarePlan.PlanStatus status);
}
