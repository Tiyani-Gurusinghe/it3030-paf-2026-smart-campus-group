package lk.sliit.smartcampus.ticket.repository;

import lk.sliit.smartcampus.ticket.entity.TechnicianSkill;
import lk.sliit.smartcampus.ticket.entity.TechnicianSkillId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface TechnicianSkillRepository extends JpaRepository<TechnicianSkill, TechnicianSkillId> {

    // Find technicians who have a given skill
    @Query("SELECT ts.userId FROM TechnicianSkill ts WHERE ts.skillId = :skillId")
    List<Long> findTechnicianIdsBySkillId(Long skillId);

    // Validate technician has skill
    boolean existsByUserIdAndSkillId(Long userId, Long skillId);
}