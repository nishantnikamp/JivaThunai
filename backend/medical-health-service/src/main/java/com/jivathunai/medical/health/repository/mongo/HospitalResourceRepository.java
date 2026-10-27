package com.jivathunai.medical.health.repository.mongo;

import com.jivathunai.medical.health.entity.mongo.HospitalResource;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface HospitalResourceRepository extends MongoRepository<HospitalResource, String> {
    Optional<HospitalResource> findByResourceId(UUID resourceId);
    Optional<HospitalResource> findByHospitalIdAndResourceCode(UUID hospitalId, String resourceCode);
    List<HospitalResource> findByHospitalId(UUID hospitalId);
    List<HospitalResource> findByHospitalIdAndResourceType(UUID hospitalId, HospitalResource.ResourceType type);
    List<HospitalResource> findByResourceType(HospitalResource.ResourceType type);
    List<HospitalResource> findByOperationalStatus(HospitalResource.ResourceStatus status);
}
