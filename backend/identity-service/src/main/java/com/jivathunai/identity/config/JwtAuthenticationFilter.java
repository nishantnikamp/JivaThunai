package com.jivathunai.identity.config;

import com.jivathunai.identity.service.JwtTokenProvider;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider tokenProvider;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        try {
            String jwt = getJwtFromRequest(request);
            List<GrantedAuthority> authorities = new java.util.ArrayList<>();
            String principal = "anonymous";

            if (StringUtils.hasText(jwt) && tokenProvider.validateToken(jwt)) {
                Claims claims = tokenProvider.getClaimsFromToken(jwt);
                principal = claims.getSubject();
                
                Object rolesObj = claims.get("roles");
                if (rolesObj instanceof java.util.Collection<?> col) {
                    for (Object r : col) {
                        if (r != null) {
                            String roleStr = r.toString().trim();
                            if (!roleStr.isEmpty()) {
                                authorities.add(new SimpleGrantedAuthority(roleStr.startsWith("ROLE_") ? roleStr : "ROLE_" + roleStr));
                                authorities.add(new SimpleGrantedAuthority(roleStr));
                            }
                        }
                    }
                } else if (rolesObj != null) {
                    String roleStr = rolesObj.toString().trim();
                    authorities.add(new SimpleGrantedAuthority(roleStr.startsWith("ROLE_") ? roleStr : "ROLE_" + roleStr));
                    authorities.add(new SimpleGrantedAuthority(roleStr));
                }
            }

            // Also check gateway-injected X-User-Roles header
            String gatewayRoles = request.getHeader("X-User-Roles");
            if (StringUtils.hasText(gatewayRoles)) {
                String gatewayUserId = request.getHeader("X-User-Id");
                if (principal.equals("anonymous") && StringUtils.hasText(gatewayUserId)) {
                    principal = "user-" + gatewayUserId;
                }
                for (String r : gatewayRoles.split(",")) {
                    String roleStr = r.trim();
                    if (!roleStr.isEmpty()) {
                        authorities.add(new SimpleGrantedAuthority(roleStr.startsWith("ROLE_") ? roleStr : "ROLE_" + roleStr));
                        authorities.add(new SimpleGrantedAuthority(roleStr));
                    }
                }
            }

            if (!authorities.isEmpty()) {
                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        principal, null, authorities);
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception ex) {
            logger.error("Could not set user authentication in security context", ex);
        }

        filterChain.doFilter(request, response);
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
