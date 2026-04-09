package lk.sliit.smartcampus.ticket.repository;

import lk.sliit.smartcampus.ticket.entity.ResourceTypeSkill;
import lk.sliit.smartcampus.ticket.entity.ResourceTypeSkillId;
import lk.sliit.smartcampus.ticket.entity.TicketResourceType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ResourceTypeSkillRepository extends JpaRepository<ResourceTypeSkill, ResourceTypeSkillId> {

    List<ResourceTypeSkill> findByResourceType(TicketResourceType resourceType);

    boolean existsByResourceTypeAndSkillId(TicketResourceType resourceType, Long skillId);
}