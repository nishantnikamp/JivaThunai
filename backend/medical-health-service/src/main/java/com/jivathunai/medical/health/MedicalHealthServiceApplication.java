package com.jivathunai.medical.health;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class MedicalHealthServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(MedicalHealthServiceApplication.class, args);
    }
}
