package lk.sliit.smartcampus.user.repository;

import lk.sliit.smartcampus.common.enums.RoleType;
import lk.sliit.smartcampus.user.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(RoleType name);
}
