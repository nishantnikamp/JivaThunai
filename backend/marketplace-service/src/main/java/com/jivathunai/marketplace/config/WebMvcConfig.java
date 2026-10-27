package com.jivathunai.marketplace.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@RequiredArgsConstructor
public class WebMvcConfig implements WebMvcConfigurer {

    private final KycInterceptor kycInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // Apply KYC interceptor to checkout and messaging routes
        registry.addInterceptor(kycInterceptor)
                .addPathPatterns("/api/v1/marketplace/checkout/**")
                .addPathPatterns("/api/v1/marketplace/communications/**");
    }


}
