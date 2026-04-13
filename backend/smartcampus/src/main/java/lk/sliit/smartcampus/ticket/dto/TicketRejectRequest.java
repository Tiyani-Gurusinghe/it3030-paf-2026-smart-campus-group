package lk.sliit.smartcampus.ticket.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class TicketRejectRequest {

    @NotBlank(message = "Rejected reason is required")
    @Size(max = 4000, message = "Rejected reason must be at most 4000 characters")
    private String rejectedReason;

    public String getRejectedReason() {
        return rejectedReason;
    }

    public void setRejectedReason(String rejectedReason) {
        this.rejectedReason = rejectedReason;
    }
}