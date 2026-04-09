package lk.sliit.smartcampus.ticket.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lk.sliit.smartcampus.ticket.entity.TicketStatus;

public class TicketStatusUpdateRequest {

    @NotNull(message = "Status is required")
    private TicketStatus status;

    private Long assignedTo;

    @Size(max = 4000, message = "Resolution notes must be at most 4000 characters")
    private String resolutionNotes;

    @Size(max = 4000, message = "Rejected reason must be at most 4000 characters")
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