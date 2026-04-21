package lk.sliit.smartcampus.ticket.dto;

import java.time.LocalDateTime;

public class TicketAttachmentResponse {

    private Long id;
    private Long ticketId;
    private String fileUrl;
    private Long uploadedBy;
    private LocalDateTime createdAt;

    public Long getId() {
        return id;
    }

    public Long getTicketId() {
        return ticketId;
    }

    public String getFileUrl() {
        return fileUrl;
    }

    public Long getUploadedBy() {
        return uploadedBy;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setTicketId(Long ticketId) {
        this.ticketId = ticketId;
    }

    public void setFileUrl(String fileUrl) {
        this.fileUrl = fileUrl;
    }

    public void setUploadedBy(Long uploadedBy) {
        this.uploadedBy = uploadedBy;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}