package lk.sliit.smartcampus.user.repository;

import java.util.Optional;
import lk.sliit.smartcampus.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByEmailIgnoreCase(String email);
}
