package com.jivathunai.medical.health.repository.mongo;

import com.jivathunai.medical.health.entity.mongo.HospitalFacilityProfile;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface HospitalFacilityProfileRepository extends MongoRepository<HospitalFacilityProfile, String> {
    Optional<HospitalFacilityProfile> findByOrganizationId(UUID organizationId);
    void deleteByOrganizationId(UUID organizationId);
}
