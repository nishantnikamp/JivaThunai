package com.jivathunai.medical.health.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configure(http))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    "/api/v1/vet/org/register",
                    "/api/v1/vet-appointments/**",
                    "/api/v1/bookings/**",
                    "/api/v1/medical/**",
                    "/api/v1/clinical/**",
                    "/api/v1/emergency/**",
                    "/api/v1/vet/**"
                ).permitAll()
                .anyRequest().permitAll()
            );
        return http.build();
    }
}
