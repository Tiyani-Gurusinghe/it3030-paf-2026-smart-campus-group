package lk.sliit.smartcampus.ticket.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lk.sliit.smartcampus.ticket.entity.TicketPriority;

public class TicketRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 120, message = "Title must be at most 120 characters")
    private String title;

    @NotBlank(message = "Description is required")
    @Size(max = 2000, message = "Description must be at most 2000 characters")
    private String description;

    @NotNull(message = "Resource id is required")
    private Long resourceId;

    @NotNull(message = "Required skill id is required")
    private Long requiredSkillId;

    @NotNull(message = "Priority is required")
    private TicketPriority priority;

    @NotNull(message = "Reported by is required")
    private Long reportedBy;

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

    public Long getReportedBy() {
        return reportedBy;
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

    public void setReportedBy(Long reportedBy) {
        this.reportedBy = reportedBy;
    }
}