package lk.sliit.smartcampus.auth.service;

import lk.sliit.smartcampus.exception.UnauthorizedException;
import lk.sliit.smartcampus.user.entity.User;
import lk.sliit.smartcampus.user.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
public class AuthenticatedUserService {

    private final UserRepository userRepository;

    public AuthenticatedUserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new UnauthorizedException("Authentication is required");
        }

        String email = authentication.getName();
        if (email == null || email.isBlank()) {
            throw new UnauthorizedException("Authenticated user email is missing");
        }

        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new UnauthorizedException("Authenticated user was not found"));
    }

    public Long getCurrentUserId(Authentication authentication) {
        return getCurrentUser(authentication).getId();
    }
}
