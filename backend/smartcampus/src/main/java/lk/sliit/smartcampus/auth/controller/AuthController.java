package lk.sliit.smartcampus.auth.controller;
import org.springframework.http.HttpStatus;

import lk.sliit.smartcampus.auth.dto.LoginRequest;
import lk.sliit.smartcampus.exception.BadRequestException;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import lk.sliit.smartcampus.auth.dto.GoogleLoginRequest;
import lk.sliit.smartcampus.auth.dto.LoginResponse;
import lk.sliit.smartcampus.auth.util.JwtUtils;
import lk.sliit.smartcampus.common.enums.RoleType;
import lk.sliit.smartcampus.user.entity.Role;
import lk.sliit.smartcampus.user.entity.User;
import lk.sliit.smartcampus.user.entity.UserRole;
import lk.sliit.smartcampus.user.repository.RoleRepository;
import lk.sliit.smartcampus.user.repository.UserRepository;
import lk.sliit.smartcampus.auth.dto.SignupRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class AuthController {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final JwtUtils jwtUtils;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.google.client-id:YOUR_GOOGLE_CLIENT_ID}")
    private String googleClientId;

    public AuthController(UserRepository userRepository, RoleRepository roleRepository, JwtUtils jwtUtils, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.jwtUtils = jwtUtils;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public ResponseEntity<Object> login(@RequestBody LoginRequest request) {
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new BadRequestException("Email is required");
        }
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new BadRequestException("Password is required");
        }

        String email = request.getEmail().trim();

        return userRepository
                .findByEmailIgnoreCase(email)
                .map(user -> {
                    if (user.getPassword() == null || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body((Object)"Invalid email or password");
                    }
                    String jwt = jwtUtils.generateJwtToken(user);
                    return ResponseEntity.ok((Object) new LoginResponse(jwt, lk.sliit.smartcampus.user.mapper.UserMapper.toDto(user)));
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid email or password"));
    }

    @PostMapping("/signup")
    public ResponseEntity<Object> signup(@RequestBody SignupRequest request) {
        if (request.getFullName() == null || request.getFullName().isBlank()) throw new BadRequestException("Name is required");
        if (request.getEmail() == null || request.getEmail().isBlank()) throw new BadRequestException("Email is required");
        if (request.getCampusId() == null || request.getCampusId().isBlank()) throw new BadRequestException("Campus ID is required");
        if (request.getPassword() == null || request.getPassword().isBlank()) throw new BadRequestException("Password is required");

        String campusId = request.getCampusId().trim();
        if (!campusId.matches("^IT\\d{8}$")) {
            throw new BadRequestException("Campus ID must start with 'IT' followed by 8 numbers");
        }

        String password = request.getPassword();
        if (!password.matches("^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{6,}$")) {
            throw new BadRequestException("Password must be at least 6 characters and contain both letters and numbers");
        }

        if (userRepository.existsByEmailIgnoreCase(request.getEmail().trim())) {
            throw new BadRequestException("Email is already registered");
        }
        if (userRepository.existsByCampusId(campusId)) {
            throw new BadRequestException("Campus ID is already registered");
        }

        User user = new User();
        user.setFullName(request.getFullName().trim());
        user.setEmail(request.getEmail().trim());
        user.setCampusId(campusId);
        user.setPassword(passwordEncoder.encode(password));

        user = userRepository.save(user);

        Role userRole = roleRepository.findByName(RoleType.USER)
                .orElseThrow(() -> new RuntimeException("Error: Role USER is not found."));
        UserRole ur = new UserRole();
        ur.setUser(user);
        ur.setRole(userRole);
        ur.setUserId(user.getId());
        ur.setRoleId(userRole.getId());
        user.getUserRoles().add(ur);

        userRepository.save(user);

        String jwt = jwtUtils.generateJwtToken(user);
        return ResponseEntity.ok(new LoginResponse(jwt, lk.sliit.smartcampus.user.mapper.UserMapper.toDto(user)));
    }

    @PostMapping("/google")
    public ResponseEntity<Object> googleLogin(@RequestBody GoogleLoginRequest request) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken idToken = verifier.verify(request.getIdToken());
            if (idToken != null) {
                GoogleIdToken.Payload payload = idToken.getPayload();
                String email = payload.getEmail();
                String googleId = payload.getSubject();
                String name = (String) payload.get("name");

                // Find user by email
                Optional<User> optionalUser = userRepository.findByEmailIgnoreCase(email);
                User user;
                if (optionalUser.isPresent()) {
                    user = optionalUser.get();
                    // Update oauth info if not present
                    if (user.getOauthId() == null) {
                        user.setOauthId(googleId);
                        user.setOauthProvider("GOOGLE");
                        userRepository.save(user);
                    }
                } else {
                    // Create new user
                    user = new User();
                    user.setEmail(email);
                    user.setFullName(name);
                    user.setOauthId(googleId);
                    user.setOauthProvider("GOOGLE");

                    user = userRepository.save(user);

                    // Assign USER role
                    Role userRole = roleRepository.findByName(RoleType.USER)
                            .orElseThrow(() -> new RuntimeException("Error: Role USER is not found."));
                    UserRole ur = new UserRole();
                    ur.setUser(user);
                    ur.setRole(userRole);
                    ur.setUserId(user.getId());
                    ur.setRoleId(userRole.getId());
                    user.getUserRoles().add(ur);

                    userRepository.save(user);
                }

                String jwt = jwtUtils.generateJwtToken(user);
                return ResponseEntity.ok(new LoginResponse(jwt, lk.sliit.smartcampus.user.mapper.UserMapper.toDto(user)));
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid ID token.");
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error processing Google Sign-in.");
        }
    }

    @GetMapping("/seed-passwords")
    public ResponseEntity<String> seedPasswords() {
        String encoded = passwordEncoder.encode("Password123");
        int count = 0;
        int totalUsers = 0;
        for (User user : userRepository.findAll()) {
            totalUsers++;
            if (user.getPassword() == null || user.getPassword().isEmpty()) {
                user.setPassword(encoded);
                userRepository.save(user);
                count++;
            }
        }
        return ResponseEntity.ok("Successfully seeded passwords for " + count + " out of " + totalUsers + " total users to 'Password123'.");
    }
}

