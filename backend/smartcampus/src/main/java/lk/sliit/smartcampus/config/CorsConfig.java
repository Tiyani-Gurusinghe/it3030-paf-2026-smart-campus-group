package lk.sliit.smartcampus.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.List;

@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        
        // Allow the origins where your frontend might be running
        config.setAllowedOrigins(List.of(
            "http://localhost:5173",
            "http://localhost:5174",
            "http://localhost:5175",
            "http://localhost:3000"
        ));
        
        // Allow all standard headers
        config.addAllowedHeader("*");
        
        // Allow all HTTP methods (GET, POST, PUT, DELETE, etc.)
        config.addAllowedMethod("*");
        
        // Allow cookies/auth headers to be sent
        config.setAllowCredentials(true);
        
        // Expose custom headers used by your application
        config.setExposedHeaders(List.of("X-User-Id", "Authorization"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // Apply this configuration to all paths
        source.registerCorsConfiguration("/**", config);

        return new CorsFilter(source);
    }
}