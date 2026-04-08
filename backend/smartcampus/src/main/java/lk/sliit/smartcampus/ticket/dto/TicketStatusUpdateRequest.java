package lk.sliit.smartcampus.ticket.dto;

import jakarta.validation.constraints.NotNull;
import lk.sliit.smartcampus.ticket.entity.TicketStatus;

public class TicketStatusUpdateRequest {

    @NotNull(message = "Status is required")
    private TicketStatus status;

    private Long assignedTo;
    private String resolutionNotes;
    private String rejectedReason;

    public TicketStatus getStatus() {
        return status;
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

    public void setStatus(TicketStatus status) {
        this.status = status;
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
}