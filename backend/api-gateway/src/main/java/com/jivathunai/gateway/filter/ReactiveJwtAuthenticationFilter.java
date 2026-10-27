package com.jivathunai.gateway.filter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Collection;

@Component
public class ReactiveJwtAuthenticationFilter implements GlobalFilter, Ordered {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getURI().getPath();

        // Allow public auth & metadata endpoints without token checks, and allow all OPTIONS requests for CORS
        boolean isPublicEndpoint = request.getMethod().name().equals("OPTIONS") || 
            path.startsWith("/api/v1/auth") || 
            path.startsWith("/api/v1/users/register") ||
            path.startsWith("/api/v1/media") ||
            path.startsWith("/ws/") ||
            path.contains("/api/v1/pets/public") ||
            path.contains("/api/v1/pets/public-passport") ||
            path.startsWith("/api/v1/public") ||
            path.startsWith("/api/v1/emergency") ||
            path.startsWith("/api/v1/invitations/verify-code") ||
            path.startsWith("/api/v1/invitations/register") ||
            path.startsWith("/api/v1/vet/org/register") ||
            path.startsWith("/api/v1/payments/webhook") ||
            path.contains("/receipt") ||
            path.startsWith("/api/v1/medical/public") ||
            path.startsWith("/api/v1/vet-appointments") ||
            path.startsWith("/api/v1/bookings") ||
            path.startsWith("/api/v1/vet") ||
            (request.getMethod().name().equals("GET") && (
                path.startsWith("/api/v1/pets") || 
                path.startsWith("/api/v1/petproduct") || 
                path.startsWith("/api/v1/pet") || 
                path.startsWith("/api/v1/products") || 
                path.startsWith("/api/v1/marketplace") || 
                path.startsWith("/api/v1/adoptions") ||
                path.startsWith("/api/v1/emergency") ||
                path.startsWith("/api/v1/profile/veterinary") ||
                path.matches("^/api/v1/profile/\\d+/photo$")
            ));

        String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            if (isPublicEndpoint) {
                return chain.filter(exchange);
            }
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }

        String token = authHeader.substring(7);
        try {
            SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
            Claims claims = Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            Object userIdClaim = claims.get("userId");
            if (userIdClaim == null) {
                userIdClaim = claims.get("id");
            }
            String userId = (userIdClaim != null) ? userIdClaim.toString() : "";

            Object rolesObj = claims.get("roles");
            String rolesStr = "";
            if (rolesObj instanceof Collection<?>) {
                rolesStr = String.join(",", ((Collection<?>) rolesObj).stream().map(Object::toString).toList());
            } else if (rolesObj != null) {
                rolesStr = rolesObj.toString();
            }

            String kycStatus = claims.get("kycStatus", String.class);
            if (kycStatus == null) {
                kycStatus = "NOT_SUBMITTED";
            }

            // Inject extracted claims into downstream HTTP headers
            ServerHttpRequest.Builder reqBuilder = request.mutate();
            if (!userId.isEmpty() && !"null".equalsIgnoreCase(userId)) {
                reqBuilder.header("X-User-Id", userId);
            }
            if (!rolesStr.isEmpty()) {
                reqBuilder.header("X-User-Roles", rolesStr);
            }
            reqBuilder.header("X-KYC-Status", kycStatus);

            return chain.filter(exchange.mutate().request(reqBuilder.build()).build());

        } catch (Exception e) {
            if (isPublicEndpoint) {
                return chain.filter(exchange);
            }
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }
    }

    @Override
    public int getOrder() {
        return -1;
    }
}
