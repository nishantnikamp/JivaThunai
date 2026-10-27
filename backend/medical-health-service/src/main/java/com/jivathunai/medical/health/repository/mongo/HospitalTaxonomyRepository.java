package com.jivathunai.medical.health.repository.mongo;

import com.jivathunai.medical.health.entity.mongo.HospitalTaxonomy;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HospitalTaxonomyRepository extends MongoRepository<HospitalTaxonomy, String> {
}
