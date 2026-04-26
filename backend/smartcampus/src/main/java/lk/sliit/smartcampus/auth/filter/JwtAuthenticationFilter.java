package lk.sliit.smartcampus.auth.filter;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lk.sliit.smartcampus.auth.util.JwtUtils;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Component
// JWT filter that authenticates each request before it reaches controllers.
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtils jwtUtils;

    public JwtAuthenticationFilter(JwtUtils jwtUtils) {
        this.jwtUtils = jwtUtils;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            // Filter executes once per request and reads the Authorization header.
            String jwt = parseJwt(request);
            // Missing or invalid tokens are ignored here; protected endpoints fail later with 401.
            if (jwt != null && jwtUtils.validateJwtToken(jwt)) {
                // Validate signature/expiry before trusting claims from the token.
                Claims claims = jwtUtils.getClaimsFromJwtToken(jwt);
                // Subject identifies the user; in this app it is the user's email.
                String email = claims.getSubject();
                // Roles claim stores the user's permissions from the token.
                List<String> roles = claims.get("roles", List.class);

                // Convert token roles into Spring Security authorities using the ROLE_ prefix.
                List<SimpleGrantedAuthority> authorities = roles.stream()
                        .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
                        .collect(Collectors.toList());

                // Create an Authentication object for this request only.
                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        email, null, authorities);
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // Store authenticated user in SecurityContext so controllers can receive Authentication.
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception e) {
            // Invalid token data should not authenticate the request.
            System.err.println("Cannot set user authentication: " + e.getMessage());
        }

        // Always continue the filter chain so the request can reach the next filter or controller.
        filterChain.doFilter(request, response);
    }

    private String parseJwt(HttpServletRequest request) {
        // Extract token from: Authorization: Bearer <jwt>
        String headerAuth = request.getHeader("Authorization");

        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7);
        }

        return null;
    }
}
