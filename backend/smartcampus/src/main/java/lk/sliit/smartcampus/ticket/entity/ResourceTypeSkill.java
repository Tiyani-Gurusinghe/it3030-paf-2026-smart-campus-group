package lk.sliit.smartcampus.ticket.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "resource_type_skills")
@IdClass(ResourceTypeSkillId.class)
public class ResourceTypeSkill {

    @Id
    @Enumerated(EnumType.STRING)
    @Column(name = "resource_type", nullable = false)
    private TicketResourceType resourceType;

    @Id
    @Column(name = "skill_id", nullable = false)
    private Long skillId;

    public ResourceTypeSkill() {
    }

    public ResourceTypeSkill(TicketResourceType resourceType, Long skillId) {
        this.resourceType = resourceType;
        this.skillId = skillId;
    }

    public TicketResourceType getResourceType() {
        return resourceType;
    }

    public Long getSkillId() {
        return skillId;
    }

    public void setResourceType(TicketResourceType resourceType) {
        this.resourceType = resourceType;
    }

    public void setSkillId(Long skillId) {
        this.skillId = skillId;
    }
}