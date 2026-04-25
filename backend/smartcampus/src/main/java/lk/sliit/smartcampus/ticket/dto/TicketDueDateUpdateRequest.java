package lk.sliit.smartcampus.ticket.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public class TicketDueDateUpdateRequest {

    @NotNull(message = "Due date is required")
    @Future(message = "Due date must be in the future")
    private LocalDateTime dueAt;

    @NotBlank(message = "Extension note is required")
    @Size(max = 4000, message = "Extension note must be at most 4000 characters")
    private String note;

    public LocalDateTime getDueAt() {
        return dueAt;
    }

    public String getNote() {
        return note;
    }

    public void setDueAt(LocalDateTime dueAt) {
        this.dueAt = dueAt;
    }

    public void setNote(String note) {
        this.note = note;
    }
}
