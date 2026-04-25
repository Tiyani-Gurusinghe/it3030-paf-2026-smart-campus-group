package lk.sliit.smartcampus.ticket.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class TicketAssignRequest {

    @NotNull(message = "Assigned technician id is required")
    @Positive(message = "Assigned technician id must be a positive number")
    private Long assignedTo;

    public Long getAssignedTo() {
        return assignedTo;
    }

    public void setAssignedTo(Long assignedTo) {
        this.assignedTo = assignedTo;
    }
}
