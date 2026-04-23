package lk.sliit.smartcampus.ticket.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ticket_history")
public class TicketHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ticket_id", nullable = false)
    private Long ticketId;

    @Column(name = "actor_user_id", nullable = false)
    private Long actorUserId;

    @Column(name = "action_type", nullable = false, length = 30)
    private String actionType;

    @Column(name = "from_status", length = 20)
    private String fromStatus;

    @Column(name = "to_status", length = 20)
    private String toStatus;

    @Column(name = "previous_assignee")
    private Long previousAssignee;

    @Column(name = "new_assignee")
    private Long newAssignee;

    @Column(columnDefinition = "TEXT")
    private String note;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public TicketHistory() {
    }

    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }

    public Long getId() {
        return id;
    }

    public Long getTicketId() {
        return ticketId;
    }

    public Long getActorUserId() {
        return actorUserId;
    }

    public String getActionType() {
        return actionType;
    }

    public String getFromStatus() {
        return fromStatus;
    }

    public String getToStatus() {
        return toStatus;
    }

    public Long getPreviousAssignee() {
        return previousAssignee;
    }

    public Long getNewAssignee() {
        return newAssignee;
    }

    public String getNote() {
        return note;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setTicketId(Long ticketId) {
        this.ticketId = ticketId;
    }

    public void setActorUserId(Long actorUserId) {
        this.actorUserId = actorUserId;
    }

    public void setActionType(String actionType) {
        this.actionType = actionType;
    }

    public void setFromStatus(String fromStatus) {
        this.fromStatus = fromStatus;
    }

    public void setToStatus(String toStatus) {
        this.toStatus = toStatus;
    }

    public void setPreviousAssignee(Long previousAssignee) {
        this.previousAssignee = previousAssignee;
    }

    public void setNewAssignee(Long newAssignee) {
        this.newAssignee = newAssignee;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}