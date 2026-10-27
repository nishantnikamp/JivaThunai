package com.jivathunai.medical.health.repository.mongo;

import com.jivathunai.medical.health.entity.mongo.PatientAssignmentDesk;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PatientAssignmentDeskRepository extends MongoRepository<PatientAssignmentDesk, UUID> {

    List<PatientAssignmentDesk> findByDoctorId(UUID doctorId);

    List<PatientAssignmentDesk> findByDoctorIdAndCaseStatus(UUID doctorId, PatientAssignmentDesk.CaseStatus caseStatus);

    List<PatientAssignmentDesk> findByParentOrganizationId(UUID parentOrganizationId);

    List<PatientAssignmentDesk> findByPetIdsContaining(UUID petId);

    Optional<PatientAssignmentDesk> findByDoctorIdAndPetIdsContaining(UUID doctorId, UUID petId);
}
