package lk.sliit.smartcampus;

import lk.sliit.smartcampus.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class AuthSeedIntegrationTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    void demoUsersAreSeededAndCanBeFoundCaseInsensitively() {
        assertThat(userRepository.findByEmailIgnoreCase("user@test.com")).isPresent();
        assertThat(userRepository.findByEmailIgnoreCase("USER@TEST.COM")).isPresent();
        assertThat(userRepository.findByEmailIgnoreCase("admin@test.com")).isPresent();
    }
}
