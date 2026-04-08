package lk.sliit.smartcampus.ticket.dto;

import jakarta.validation.constraints.NotNull;

public class TicketAssignRequest {

    @NotNull(message = "Assigned technician id is required")
    private Long assignedTo;

    public Long getAssignedTo() {
        return assignedTo;
    }

    public void setAssignedTo(Long assignedTo) {
        this.assignedTo = assignedTo;
    }
}