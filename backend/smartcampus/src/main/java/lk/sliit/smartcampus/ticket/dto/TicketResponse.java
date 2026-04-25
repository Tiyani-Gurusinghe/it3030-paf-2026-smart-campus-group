package lk.sliit.smartcampus.ticket.dto;

import lk.sliit.smartcampus.ticket.entity.TicketPriority;
import lk.sliit.smartcampus.ticket.entity.TicketStatus;

import java.time.LocalDateTime;
import java.util.List;

public class TicketResponse {

    private Long id;
    private String title;
    private String location;
    private String category;
    private String description;

    private Long resourceId;
    private String resourceName;
    private String resourceType;

    private Long requiredSkillId;
    private String requiredSkillName;

    private TicketPriority priority;
    private TicketStatus status;

    private Long reportedBy;
    private String reportedByName;

    private Long assignedTo;
    private String assignedToName;

    private String preferredContact;

    private List<String> attachmentUrls;
    private int commentCount;
    private List<TicketAttachmentResponse> attachments;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime dueAt;
    private LocalDateTime originalDueAt;
    private LocalDateTime firstRespondedAt;
    private LocalDateTime resolvedAt;
    private LocalDateTime closedAt;
    private LocalDateTime dueExtendedAt;
    private Long dueExtendedBy;
    private String dueExtendedByName;
    private String dueExtensionNote;
    private String resolutionNotes;
    private String rejectedReason;
    private Long timeToFirstResponseMinutes;
    private Long timeToResolutionMinutes;

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getLocation() {
        return location;
    }

    public String getCategory() {
        return category;
    }

    public String getDescription() {
        return description;
    }

    public Long getResourceId() {
        return resourceId;
    }

    public String getResourceName() {
        return resourceName;
    }

    public String getResourceType() {
        return resourceType;
    }

    public Long getRequiredSkillId() {
        return requiredSkillId;
    }

    public String getRequiredSkillName() {
        return requiredSkillName;
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

    public String getReportedByName() {
        return reportedByName;
    }

    public Long getAssignedTo() {
        return assignedTo;
    }

    public String getAssignedToName() {
        return assignedToName;
    }

    public String getPreferredContact() {
        return preferredContact;
    }

    public List<String> getAttachmentUrls() {
        return attachmentUrls;
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

    public LocalDateTime getDueAt() {
        return dueAt;
    }

    public LocalDateTime getOriginalDueAt() {
        return originalDueAt;
    }

    public LocalDateTime getFirstRespondedAt() {
        return firstRespondedAt;
    }

    public LocalDateTime getResolvedAt() {
        return resolvedAt;
    }

    public LocalDateTime getClosedAt() {
        return closedAt;
    }

    public LocalDateTime getDueExtendedAt() {
        return dueExtendedAt;
    }

    public Long getDueExtendedBy() {
        return dueExtendedBy;
    }

    public String getDueExtendedByName() {
        return dueExtendedByName;
    }

    public String getDueExtensionNote() {
        return dueExtensionNote;
    }

    public String getResolutionNotes() {
        return resolutionNotes;
    }

    public String getRejectedReason() {
        return rejectedReason;
    }

    public Long getTimeToFirstResponseMinutes() {
        return timeToFirstResponseMinutes;
    }

    public Long getTimeToResolutionMinutes() {
        return timeToResolutionMinutes;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setResourceId(Long resourceId) {
        this.resourceId = resourceId;
    }

    public void setResourceName(String resourceName) {
        this.resourceName = resourceName;
    }

    public void setResourceType(String resourceType) {
        this.resourceType = resourceType;
    }

    public void setRequiredSkillId(Long requiredSkillId) {
        this.requiredSkillId = requiredSkillId;
    }

    public void setRequiredSkillName(String requiredSkillName) {
        this.requiredSkillName = requiredSkillName;
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

    public void setReportedByName(String reportedByName) {
        this.reportedByName = reportedByName;
    }

    public void setAssignedTo(Long assignedTo) {
        this.assignedTo = assignedTo;
    }

    public void setAssignedToName(String assignedToName) {
        this.assignedToName = assignedToName;
    }

    public void setPreferredContact(String preferredContact) {
        this.preferredContact = preferredContact;
    }

    public void setAttachmentUrls(List<String> attachmentUrls) {
        this.attachmentUrls = attachmentUrls;
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

    public void setDueAt(LocalDateTime dueAt) {
        this.dueAt = dueAt;
    }

    public void setOriginalDueAt(LocalDateTime originalDueAt) {
        this.originalDueAt = originalDueAt;
    }

    public void setFirstRespondedAt(LocalDateTime firstRespondedAt) {
        this.firstRespondedAt = firstRespondedAt;
    }

    public void setResolvedAt(LocalDateTime resolvedAt) {
        this.resolvedAt = resolvedAt;
    }

    public void setClosedAt(LocalDateTime closedAt) {
        this.closedAt = closedAt;
    }

    public void setDueExtendedAt(LocalDateTime dueExtendedAt) {
        this.dueExtendedAt = dueExtendedAt;
    }

    public void setDueExtendedBy(Long dueExtendedBy) {
        this.dueExtendedBy = dueExtendedBy;
    }

    public void setDueExtendedByName(String dueExtendedByName) {
        this.dueExtendedByName = dueExtendedByName;
    }

    public void setDueExtensionNote(String dueExtensionNote) {
        this.dueExtensionNote = dueExtensionNote;
    }

    public void setResolutionNotes(String resolutionNotes) {
        this.resolutionNotes = resolutionNotes;
    }

    public void setRejectedReason(String rejectedReason) {
        this.rejectedReason = rejectedReason;
    }

    public void setTimeToFirstResponseMinutes(Long timeToFirstResponseMinutes) {
        this.timeToFirstResponseMinutes = timeToFirstResponseMinutes;
    }

    public void setTimeToResolutionMinutes(Long timeToResolutionMinutes) {
        this.timeToResolutionMinutes = timeToResolutionMinutes;
    }
}
