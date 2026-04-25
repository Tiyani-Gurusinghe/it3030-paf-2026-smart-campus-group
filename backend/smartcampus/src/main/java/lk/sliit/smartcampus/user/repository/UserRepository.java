package lk.sliit.smartcampus.user.repository;

import java.util.Optional;
import lk.sliit.smartcampus.common.enums.RoleType;
import java.util.List;
import lk.sliit.smartcampus.user.entity.User;
import lk.sliit.smartcampus.common.enums.RoleType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByCampusId(String campusId);
    boolean existsByEmailIgnoreCase(String email);
    boolean existsByCampusId(String campusId);

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

    @Query("""
           SELECT DISTINCT ur.userId
           FROM UserRole ur
           JOIN ur.role r
           WHERE r.name = :roleType
           """)
    List<Long> findUserIdsByRoleType(@Param("roleType") RoleType roleType);
}
