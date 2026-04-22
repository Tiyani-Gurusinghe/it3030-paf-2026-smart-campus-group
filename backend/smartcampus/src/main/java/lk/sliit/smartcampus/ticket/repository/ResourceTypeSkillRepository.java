package lk.sliit.smartcampus.ticket.repository;

import lk.sliit.smartcampus.resource.enums.ResourceType;
import lk.sliit.smartcampus.ticket.entity.ResourceTypeSkill;
import lk.sliit.smartcampus.ticket.entity.ResourceTypeSkillId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ResourceTypeSkillRepository extends JpaRepository<ResourceTypeSkill, ResourceTypeSkillId> {

    List<ResourceTypeSkill> findByResourceType(ResourceType resourceType);

    boolean existsByResourceTypeAndSkillId(ResourceType resourceType, Long skillId);
}