package lk.sliit.smartcampus.ticket.dto;

import jakarta.validation.constraints.NotNull;
import lk.sliit.smartcampus.ticket.entity.TicketStatus;

public class TicketStatusUpdateRequest {

    @NotNull(message = "Status is required")
    private TicketStatus status;

    private String assignedTo;
    private String resolutionNotes;

    public TicketStatus getStatus() { return status; }
    public void setStatus(TicketStatus status) { this.status = status; }

    public String getAssignedTo() { return assignedTo; }
    public void setAssignedTo(String assignedTo) { this.assignedTo = assignedTo; }

    public String getResolutionNotes() { return resolutionNotes; }
    public void setResolutionNotes(String resolutionNotes) { this.resolutionNotes = resolutionNotes; }
}
