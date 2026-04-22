package lk.sliit.smartcampus.ticket.entity;

import lk.sliit.smartcampus.resource.enums.ResourceType;

import java.io.Serializable;
import java.util.Objects;

public class ResourceTypeSkillId implements Serializable {

    private ResourceType resourceType;
    private Long skillId;

    public ResourceTypeSkillId() {
    }

    public ResourceTypeSkillId(ResourceType resourceType, Long skillId) {
        this.resourceType = resourceType;
        this.skillId = skillId;
    }

    public ResourceType getResourceType() {
        return resourceType;
    }

    public Long getSkillId() {
        return skillId;
    }

    public void setResourceType(ResourceType resourceType) {
        this.resourceType = resourceType;
    }

    public void setSkillId(Long skillId) {
        this.skillId = skillId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ResourceTypeSkillId)) return false;
        ResourceTypeSkillId that = (ResourceTypeSkillId) o;
        return resourceType == that.resourceType &&
               Objects.equals(skillId, that.skillId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(resourceType, skillId);
    }
}