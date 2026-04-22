package lk.sliit.smartcampus.auth.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import jakarta.validation.Valid;

import lk.sliit.smartcampus.auth.dto.LoginRequest;
import lk.sliit.smartcampus.auth.dto.SignupRequest;
import lk.sliit.smartcampus.exception.BadRequestException;
import lk.sliit.smartcampus.user.repository.UserRepository;
import lk.sliit.smartcampus.user.service.UserService;
import lk.sliit.smartcampus.user.dto.UserCreateRequestDto;
import lk.sliit.smartcampus.user.mapper.UserMapper;

@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class AuthController {

    private final UserRepository userRepository;
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;

    public AuthController(UserRepository userRepository, UserService userService, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.userService = userService;
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

        return userRepository.findByEmailIgnoreCase(email)
            .<ResponseEntity<Object>>map(user -> {
                if (passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                    return ResponseEntity.ok((Object) UserMapper.toDto(user));
                } else {
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body((Object)"Invalid credentials");
                }
            })
            .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED).body((Object)"User not found"));
    }

    @PostMapping("/signup")
    public ResponseEntity<Object> signup(@Valid @RequestBody SignupRequest request) {
        UserCreateRequestDto createDto = new UserCreateRequestDto();
        createDto.setFullName(request.getFullName());
        createDto.setEmail(request.getEmail());
        createDto.setCampusId(request.getCampusId());
        createDto.setPassword(request.getPassword());
        createDto.setOauthProvider("LOCAL");
        createDto.setOauthId(request.getEmail());

        return ResponseEntity.ok(userService.createUser(createDto));
    }
}
