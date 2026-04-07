package lk.sliit.smartcampus.ticket.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lk.sliit.smartcampus.ticket.entity.TicketCategory;
import lk.sliit.smartcampus.ticket.entity.TicketPriority;

public class TicketRequest {

    @NotBlank
    @Size(max = 120)
    private String title;

    @NotBlank
    @Size(max = 120)
    private String location;

    @NotNull
    private TicketCategory category;

    @NotBlank
    @Size(max = 1000)
    private String description;

    @NotNull
    private TicketPriority priority;

    @NotBlank
    @Size(max = 120)
    private String preferredContact;

    private String assignedTo;

    private String resolutionNotes;

    private Long reportedBy;

    // GETTERS

    public String getTitle() {
        return title;
    }

    public String getLocation() {
        return location;
    }

    public TicketCategory getCategory() {
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

    public String getAssignedTo() {
        return assignedTo;
    }

    public String getResolutionNotes() {
        return resolutionNotes;
    }

    public Long getReportedBy() {
        return reportedBy;
    }

    // SETTERS

    public void setTitle(String title) {
        this.title = title;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public void setCategory(TicketCategory category) {
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

    public void setAssignedTo(String assignedTo) {
        this.assignedTo = assignedTo;
    }

    public void setResolutionNotes(String resolutionNotes) {
        this.resolutionNotes = resolutionNotes;
    }

    public void setReportedBy(Long reportedBy) {
        this.reportedBy = reportedBy;
    }
}