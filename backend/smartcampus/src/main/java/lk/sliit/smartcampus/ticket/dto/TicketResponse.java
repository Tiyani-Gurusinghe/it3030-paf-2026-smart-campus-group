package lk.sliit.smartcampus.ticket.dto;

import lk.sliit.smartcampus.ticket.entity.TicketPriority;
import lk.sliit.smartcampus.ticket.entity.TicketStatus;

import java.time.LocalDateTime;
import java.util.List;

public class TicketResponse {

    private Long id;
    private String title;
    private String description;
    private Long resourceId;
    private Long requiredSkillId;
    private TicketPriority priority;
    private TicketStatus status;
    private Long reportedBy;
    private Long assignedTo;
    private String resolutionNotes;
    private String rejectedReason;
    private Long firstRespondedBy;
    private int commentCount;
    private List<TicketAttachmentResponse> attachments;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime firstResponseAt;
    private LocalDateTime dueAt;
    private LocalDateTime resolvedAt;
    private LocalDateTime closedAt;

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public Long getResourceId() {
        return resourceId;
    }

    public Long getRequiredSkillId() {
        return requiredSkillId;
    }

    public TicketPriority getPriority() {
        return priority;
    }

    public TicketStatus getStatus() {
        return status;
    }

    public Long getReportedBy() {
        return reportedBy;
    }

    public Long getAssignedTo() {
        return assignedTo;
    }

    public String getResolutionNotes() {
        return resolutionNotes;
    }

    public String getRejectedReason() {
        return rejectedReason;
    }

    public Long getFirstRespondedBy() {
        return firstRespondedBy;
    }

    public int getCommentCount() {
        return commentCount;
    }

    public List<TicketAttachmentResponse> getAttachments() {
        return attachments;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public LocalDateTime getFirstResponseAt() {
        return firstResponseAt;
    }

    public LocalDateTime getDueAt() {
        return dueAt;
    }

    public LocalDateTime getResolvedAt() {
        return resolvedAt;
    }

    public LocalDateTime getClosedAt() {
        return closedAt;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setResourceId(Long resourceId) {
        this.resourceId = resourceId;
    }

    public void setRequiredSkillId(Long requiredSkillId) {
        this.requiredSkillId = requiredSkillId;
    }

    public void setPriority(TicketPriority priority) {
        this.priority = priority;
    }

    public void setStatus(TicketStatus status) {
        this.status = status;
    }

    public void setReportedBy(Long reportedBy) {
        this.reportedBy = reportedBy;
    }

    public void setAssignedTo(Long assignedTo) {
        this.assignedTo = assignedTo;
    }

    public void setResolutionNotes(String resolutionNotes) {
        this.resolutionNotes = resolutionNotes;
    }

    public void setRejectedReason(String rejectedReason) {
        this.rejectedReason = rejectedReason;
    }

    public void setFirstRespondedBy(Long firstRespondedBy) {
        this.firstRespondedBy = firstRespondedBy;
    }

    public void setCommentCount(int commentCount) {
        this.commentCount = commentCount;
    }

    public void setAttachments(List<TicketAttachmentResponse> attachments) {
        this.attachments = attachments;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public void setFirstResponseAt(LocalDateTime firstResponseAt) {
        this.firstResponseAt = firstResponseAt;
    }

    public void setDueAt(LocalDateTime dueAt) {
        this.dueAt = dueAt;
    }

    public void setResolvedAt(LocalDateTime resolvedAt) {
        this.resolvedAt = resolvedAt;
    }

    public void setClosedAt(LocalDateTime closedAt) {
        this.closedAt = closedAt;
    }
}