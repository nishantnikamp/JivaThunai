package com.jivathunai.identity.repository;

import com.jivathunai.identity.entity.CmsSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CmsSettingRepository extends JpaRepository<CmsSetting, String> {
    List<CmsSetting> findByCategory(String category);
}
