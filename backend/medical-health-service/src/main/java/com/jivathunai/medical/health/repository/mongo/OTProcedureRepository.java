package com.jivathunai.medical.health.repository.mongo;

import com.jivathunai.medical.health.entity.mongo.OTProcedure;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OTProcedureRepository extends MongoRepository<OTProcedure, String> {
    Optional<OTProcedure> findByProcedureId(UUID procedureId);
    List<OTProcedure> findByHospitalId(UUID hospitalId);
    List<OTProcedure> findByLeadSurgeonId(UUID leadSurgeonId);
    List<OTProcedure> findByStatus(OTProcedure.ProcedureStatus status);
    List<OTProcedure> findByResourceIdAndStatus(UUID resourceId, OTProcedure.ProcedureStatus status);
}
