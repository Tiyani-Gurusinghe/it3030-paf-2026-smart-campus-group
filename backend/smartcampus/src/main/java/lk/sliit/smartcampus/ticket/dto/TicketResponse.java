package lk.sliit.smartcampus.ticket.dto;

import java.time.LocalDateTime;
import lk.sliit.smartcampus.ticket.entity.TicketCategory;
import lk.sliit.smartcampus.ticket.entity.TicketPriority;
import lk.sliit.smartcampus.ticket.entity.TicketStatus;

public class TicketResponse {
    private Long id;
    private String title;
    private String location;
    private TicketCategory category;
    private String description;
    private TicketPriority priority;
    private String preferredContact;
    private TicketStatus status;
    private String assignedTo;
    private String resolutionNotes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public TicketCategory getCategory() { return category; }
    public void setCategory(TicketCategory category) { this.category = category; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public TicketPriority getPriority() { return priority; }
    public void setPriority(TicketPriority priority) { this.priority = priority; }

    public String getPreferredContact() { return preferredContact; }
    public void setPreferredContact(String preferredContact) { this.preferredContact = preferredContact; }

    public TicketStatus getStatus() { return status; }
    public void setStatus(TicketStatus status) { this.status = status; }

    public String getAssignedTo() { return assignedTo; }
    public void setAssignedTo(String assignedTo) { this.assignedTo = assignedTo; }

    public String getResolutionNotes() { return resolutionNotes; }
    public void setResolutionNotes(String resolutionNotes) { this.resolutionNotes = resolutionNotes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
