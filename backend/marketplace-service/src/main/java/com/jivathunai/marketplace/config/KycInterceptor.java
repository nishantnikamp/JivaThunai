package com.jivathunai.marketplace.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.client.RestTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;

@Component
public class KycInterceptor implements HandlerInterceptor {

    @Value("${identity.service.url:http://localhost:8081}")
    private String identityServiceUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String buyerIdStr = request.getParameter("buyerId");
        String sellerIdStr = request.getParameter("sellerId");

        if (buyerIdStr != null && sellerIdStr != null) {
            String url = identityServiceUrl + "/api/v1/kyc/verify-trade?buyerId=" + buyerIdStr + "&sellerId=" + sellerIdStr;
            try {
                ResponseEntity<Boolean> kycResponse = restTemplate.getForEntity(url, Boolean.class);
                if (Boolean.TRUE.equals(kycResponse.getBody())) {
                    return true;
                }
            } catch (Exception e) {
                // Feign/RestTemplate throws 403 as exception if not handled
            }
            response.setStatus(403);
            response.getWriter().write("Both buyer and seller must have APPROVED KYC statuses to initiate trade or communications.");
            return false;
        }

        return true;
    }
}
