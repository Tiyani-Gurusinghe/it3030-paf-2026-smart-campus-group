package lk.sliit.smartcampus.ticket.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "technician_skills")
@IdClass(TechnicianSkillId.class)
public class TechnicianSkill {

    @Id
    @Column(name = "user_id")
    private Long userId;

    @Id
    @Column(name = "skill_id")
    private Long skillId;

    public TechnicianSkill() {
    }

    public TechnicianSkill(Long userId, Long skillId) {
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
}