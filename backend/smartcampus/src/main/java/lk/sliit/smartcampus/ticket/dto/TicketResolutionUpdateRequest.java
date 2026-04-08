package lk.sliit.smartcampus.ticket.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class TicketResolutionUpdateRequest {

    @NotBlank(message = "Resolution notes are required")
    @Size(max = 4000, message = "Resolution notes must be at most 4000 characters")
    private String resolutionNotes;

    public String getResolutionNotes() {
        return resolutionNotes;
    }

    public void setResolutionNotes(String resolutionNotes) {
        this.resolutionNotes = resolutionNotes;
    }
}