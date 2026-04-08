package lk.sliit.smartcampus;

import lk.sliit.smartcampus.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

// NEW SPRING BOOT 4.0 IMPORT:
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;

import static org.assertj.core.api.Assertions.assertThat;

// THE ULTIMATE SHIELD: Forcefully kills MySQL connections and uses H2 for this test
@ActiveProfiles("test") 
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.ANY) 
@SpringBootTest(properties = {
    "spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1;MODE=MySQL",
    "spring.datasource.driverClassName=org.h2.Driver",
    "spring.datasource.username=sa",
    "spring.datasource.password=",
    "spring.flyway.enabled=false",
    "spring.jpa.hibernate.ddl-auto=create-drop",
    "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect"
})
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