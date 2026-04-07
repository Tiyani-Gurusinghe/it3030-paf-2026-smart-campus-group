package lk.sliit.smartcampus.auth.controller;
import org.springframework.http.HttpStatus;

import lk.sliit.smartcampus.auth.dto.LoginRequest;
import lk.sliit.smartcampus.exception.BadRequestException;
import lk.sliit.smartcampus.user.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final UserRepository userRepository;

    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<Object> login(@RequestBody LoginRequest request) {
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new BadRequestException("Email is required");
        }

        String email = request.getEmail().trim();

        return userRepository
                .findByEmailIgnoreCase(email)
                .map(user -> ResponseEntity.ok((Object) user))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not found"));
    }
}
