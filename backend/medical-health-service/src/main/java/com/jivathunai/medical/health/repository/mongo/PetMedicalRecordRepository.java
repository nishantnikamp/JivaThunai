package com.jivathunai.medical.health.repository.mongo;

import com.jivathunai.medical.health.entity.mongo.PetMedicalRecord;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PetMedicalRecordRepository extends MongoRepository<PetMedicalRecord, String> {

    Optional<PetMedicalRecord> findByPetId(UUID petId);

    List<PetMedicalRecord> findByOwnerId(UUID ownerId);

    @Query("{ 'vaccinationSchedule': { $elemMatch: { 'nextDueDate': { $lte: ?0 }, 'status': { $in: ['SCHEDULED', 'OVERDUE'] } } } }")
    List<PetMedicalRecord> findRecordsWithDueOrOverdueVaccinations(LocalDate targetDate);

    @Query("{ 'vaccinationSchedule': { $elemMatch: { 'nextDueDate': ?0, 'status': 'SCHEDULED' } } }")
    List<PetMedicalRecord> findRecordsWithVaccinationsDueOn(LocalDate exactDate);

    @Query(value = "{}", fields = "{ 'petId': 1, 'petName': 1, 'species': 1, 'breed': 1, 'ownerName': 1, 'ownerPhone': 1, 'allergies': 1, 'vitalSignsHistory': 1, 'vaccinationSchedule': 1 }")
    List<PetMedicalRecord> findAllPatientSummaries();
}
