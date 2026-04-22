package lk.sliit.smartcampus.ticket.repository;

import lk.sliit.smartcampus.resource.enums.ResourceType;
import lk.sliit.smartcampus.ticket.entity.ResourceTypeSkill;
import lk.sliit.smartcampus.ticket.entity.ResourceTypeSkillId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ResourceTypeSkillRepository extends JpaRepository<ResourceTypeSkill, ResourceTypeSkillId> {

    interface SkillOptionView {
        Long getId();
        String getName();
    }

    List<ResourceTypeSkill> findByResourceType(ResourceType resourceType);

    boolean existsByResourceTypeAndSkillId(ResourceType resourceType, Long skillId);

    @Query(value = """
            SELECT s.id AS id, s.name AS name
            FROM skills s
            INNER JOIN resource_type_skills rts ON rts.skill_id = s.id
            WHERE rts.resource_type = :resourceType
            ORDER BY s.name
            """, nativeQuery = true)
    List<SkillOptionView> findSkillOptionsByResourceType(@Param("resourceType") String resourceType);
}
