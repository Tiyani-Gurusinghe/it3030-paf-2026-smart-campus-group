package lk.sliit.smartcampus.user.repository;

import java.util.Optional;
import lk.sliit.smartcampus.common.enums.RoleType;
import lk.sliit.smartcampus.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    @EntityGraph(attributePaths = {"userRoles", "userRoles.role"})
    Optional<User> findByEmailIgnoreCase(String email);

    @Query("""
           SELECT COUNT(DISTINCT u.id)
           FROM User u
           JOIN u.userRoles ur
           JOIN ur.role r
           WHERE r.name = :role
           """)
    long countUsersByRole(@Param("role") RoleType role);
}
