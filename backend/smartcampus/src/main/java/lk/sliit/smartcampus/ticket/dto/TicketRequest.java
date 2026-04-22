package lk.sliit.smartcampus.ticket.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lk.sliit.smartcampus.ticket.entity.TicketPriority;

public class TicketRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 120, message = "Title must be at most 120 characters")
    private String title;

    @NotBlank(message = "Location is required")
    @Size(max = 120, message = "Location must be at most 120 characters")
    private String location;

    @NotBlank(message = "Category is required")
    @Size(max = 30, message = "Category must be at most 30 characters")
    private String category;

    @NotBlank(message = "Description is required")
    @Size(max = 1000, message = "Description must be at most 1000 characters")
    private String description;

    @NotNull(message = "Resource id is required")
    private Long resourceId;

    @NotNull(message = "Required skill id is required")
    private Long requiredSkillId;

    @NotNull(message = "Priority is required")
    private TicketPriority priority;

    @NotBlank(message = "Preferred contact is required")
    @Size(max = 120, message = "Preferred contact must be at most 120 characters")
    private String preferredContact;

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

    public Long getRequiredSkillId() {
        return requiredSkillId;
    }

    public TicketPriority getPriority() {
        return priority;
    }

    public String getPreferredContact() {
        return preferredContact;
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

    public void setRequiredSkillId(Long requiredSkillId) {
        this.requiredSkillId = requiredSkillId;
    }

    public void setPriority(TicketPriority priority) {
        this.priority = priority;
    }

    public void setPreferredContact(String preferredContact) {
        this.preferredContact = preferredContact;
    }
}