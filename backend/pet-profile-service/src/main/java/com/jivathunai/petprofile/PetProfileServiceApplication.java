package com.jivathunai.petprofile;

import com.jivathunai.petprofile.repository.OwnershipHistoryRepository;
import com.jivathunai.petprofile.repository.PetProfileDocRepository;
import com.jivathunai.petprofile.repository.PetRegistryRepository;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@SpringBootApplication
@EntityScan("com.jivathunai.petprofile.entity")
@EnableJpaRepositories(
    basePackages = "com.jivathunai.petprofile.repository",
    includeFilters = @ComponentScan.Filter(
        type = FilterType.ASSIGNABLE_TYPE,
        classes = {PetRegistryRepository.class, OwnershipHistoryRepository.class}
    )
)
@EnableMongoRepositories(
    basePackages = "com.jivathunai.petprofile.repository",
    includeFilters = @ComponentScan.Filter(
        type = FilterType.ASSIGNABLE_TYPE,
        classes = {PetProfileDocRepository.class}
    )
)
public class PetProfileServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(PetProfileServiceApplication.class, args);
    }
}

