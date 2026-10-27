package com.jivathunai.gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    @Bean
    public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http) {
        http
            .csrf(ServerHttpSecurity.CsrfSpec::disable)
            .cors(org.springframework.security.config.Customizer.withDefaults())
            .authorizeExchange(exchanges -> exchanges
                // Allow auth endpoints
                .pathMatchers("/api/v1/auth/**", "/api/v1/users/register").permitAll()
                // Permit all OPTIONS requests
                .pathMatchers(org.springframework.http.HttpMethod.OPTIONS).permitAll()
                // Let downstream services handle their own authorization, or enforce here
                .anyExchange().permitAll()
            );
        return http.build();
    }
}
