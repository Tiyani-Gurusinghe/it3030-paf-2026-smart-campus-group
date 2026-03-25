package lk.sliit.smartcampus.ticket.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lk.sliit.smartcampus.ticket.entity.TicketStatus;

public class TicketStatusUpdateRequest {

    @NotNull(message = "Status is required")
    private TicketStatus status;

    @Size(max = 120, message = "Assigned to must be at most 120 characters")
    private String assignedTo;

    @Size(max = 1000, message = "Resolution notes must be at most 1000 characters")
    private String resolutionNotes;

    public TicketStatus getStatus() {
        return status;
    }

    public String getAssignedTo() {
        return assignedTo;
    }

    public String getResolutionNotes() {
        return resolutionNotes;
    }

    public void setStatus(TicketStatus status) {
        this.status = status;
    }

    public void setAssignedTo(String assignedTo) {
        this.assignedTo = assignedTo;
    }

    public void setResolutionNotes(String resolutionNotes) {
        this.resolutionNotes = resolutionNotes;
    }
}