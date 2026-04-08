package lk.sliit.smartcampus.ticket.entity;

import java.io.Serializable;
import java.util.Objects;

public class TechnicianSkillId implements Serializable {

    private Long userId;
    private Long skillId;

    public TechnicianSkillId() {
    }

    public TechnicianSkillId(Long userId, Long skillId) {
        this.userId = userId;
        this.skillId = skillId;
    }

    public Long getUserId() {
        return userId;
    }

    public Long getSkillId() {
        return skillId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public void setSkillId(Long skillId) {
        this.skillId = skillId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof TechnicianSkillId)) return false;
        TechnicianSkillId that = (TechnicianSkillId) o;
        return Objects.equals(userId, that.userId) &&
               Objects.equals(skillId, that.skillId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userId, skillId);
    }
}