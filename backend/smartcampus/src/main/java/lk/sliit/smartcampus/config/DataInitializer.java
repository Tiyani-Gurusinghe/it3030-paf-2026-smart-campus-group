package lk.sliit.smartcampus.config;

import lk.sliit.smartcampus.user.repository.UserRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.security.crypto.password.PasswordEncoder;


@Component
public class DataInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    
    @Override
    public void run(ApplicationArguments args) {
        System.out.println("[DataInitializer] Setting secure default passwords for existing users...");
        userRepository.findAll().forEach(user -> {
            if (user.getPassword() == null || user.getPassword().isEmpty() || passwordEncoder.matches("password123", user.getPassword())) {
                user.setPassword(passwordEncoder.encode("SmartCampus!2026"));
                userRepository.save(user);
                System.out.println("Set secure default password for: " + user.getEmail());
            }
        });
    }
}