package com.jivathunai.medical.health.repository.mongo;

import com.jivathunai.medical.health.entity.mongo.DoctorLiveStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DoctorLiveStatusRepository extends MongoRepository<DoctorLiveStatus, String> {
    Optional<DoctorLiveStatus> findByDoctorId(UUID doctorId);
    List<DoctorLiveStatus> findByHospitalId(UUID hospitalId);
    List<DoctorLiveStatus> findByOperationalStatus(DoctorLiveStatus.OperationalStatus status);
}
