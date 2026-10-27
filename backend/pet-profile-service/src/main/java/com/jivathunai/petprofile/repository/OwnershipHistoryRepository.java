package com.jivathunai.petprofile.repository;

import com.jivathunai.petprofile.entity.OwnershipHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface OwnershipHistoryRepository extends JpaRepository<OwnershipHistory, UUID> {
}
