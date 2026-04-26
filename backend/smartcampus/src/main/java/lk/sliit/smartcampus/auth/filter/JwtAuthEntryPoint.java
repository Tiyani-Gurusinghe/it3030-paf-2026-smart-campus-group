package lk.sliit.smartcampus.auth.filter;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
// Handles unauthenticated access attempts to secured API endpoints.
public class JwtAuthEntryPoint implements AuthenticationEntryPoint {

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                         AuthenticationException authException) throws IOException, ServletException {
        // AuthenticationEntryPoint runs when Spring Security cannot authenticate the request.
        // 401 Unauthorized: token is missing, invalid, expired, or the user is not logged in.
        // 403 Forbidden is different: the user is authenticated but lacks permission.
        response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Error: Unauthorized");
    }
}
