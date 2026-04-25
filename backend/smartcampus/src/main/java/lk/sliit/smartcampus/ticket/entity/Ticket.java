package lk.sliit.smartcampus.ticket.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tickets")
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String title;

    @Column(nullable = false, length = 120)
    private String location;

    @Column(nullable = false, length = 30)
    private String category;

    @Column(nullable = false, length = 1000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TicketPriority priority;

    @Column(name = "preferred_contact", nullable = false, length = 120)
    private String preferredContact;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TicketStatus status;

    @Column(name = "reported_by", nullable = false)
    private Long reportedBy;

    @Column(name = "assigned_to")
    private Long assignedTo;

    @Column(name = "resource_id", nullable = false)
    private Long resourceId;

    @Column(name = "required_skill_id", nullable = false)
    private Long requiredSkillId;

    @Column(name = "due_at")
    private LocalDateTime dueAt;

    @Column(name = "original_due_at")
    private LocalDateTime originalDueAt;

    @Column(name = "first_responded_at")
    private LocalDateTime firstRespondedAt;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @Column(name = "closed_at")
    private LocalDateTime closedAt;

    @Column(name = "due_extended_at")
    private LocalDateTime dueExtendedAt;

    @Column(name = "due_extended_by")
    private Long dueExtendedBy;

    @Column(name = "due_extension_note", columnDefinition = "TEXT")
    private String dueExtensionNote;

    @Column(name = "resolution_notes", columnDefinition = "TEXT")
    private String resolutionNotes;

    @Column(name = "rejected_reason", columnDefinition = "TEXT")
    private String rejectedReason;

    @Column(name = "attachment_urls", columnDefinition = "json")
    private String attachmentUrls;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public Ticket() {
    }

    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;

        if (this.status == null) {
            this.status = TicketStatus.OPEN;
        }
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

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

    public TicketPriority getPriority() {
        return priority;
    }

    public String getPreferredContact() {
        return preferredContact;
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

    public Long getResourceId() {
        return resourceId;
    }

    public Long getRequiredSkillId() {
        return requiredSkillId;
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

    public String getDueExtensionNote() {
        return dueExtensionNote;
    }

    public String getResolutionNotes() {
        return resolutionNotes;
    }

    public String getRejectedReason() {
        return rejectedReason;
    }

    public String getAttachmentUrls() {
        return attachmentUrls;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
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

    public void setPriority(TicketPriority priority) {
        this.priority = priority;
    }

    public void setPreferredContact(String preferredContact) {
        this.preferredContact = preferredContact;
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

    public void setResourceId(Long resourceId) {
        this.resourceId = resourceId;
    }

    public void setRequiredSkillId(Long requiredSkillId) {
        this.requiredSkillId = requiredSkillId;
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

    public void setDueExtensionNote(String dueExtensionNote) {
        this.dueExtensionNote = dueExtensionNote;
    }

    public void setResolutionNotes(String resolutionNotes) {
        this.resolutionNotes = resolutionNotes;
    }

    public void setRejectedReason(String rejectedReason) {
        this.rejectedReason = rejectedReason;
    }

    public void setAttachmentUrls(String attachmentUrls) {
        this.attachmentUrls = attachmentUrls;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
