package lk.sliit.smartcampus.notification.dto;

import lk.sliit.smartcampus.notification.entity.NotificationType;

public class NotificationRequest {
    private Long userId;
    private NotificationType type;
    private String title;
    private String message;
    private Long referenceId;

    public NotificationRequest() {}

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public NotificationType getType() { return type; }
    public void setType(NotificationType type) { this.type = type; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public Long getReferenceId() { return referenceId; }
    public void setReferenceId(Long referenceId) { this.referenceId = referenceId; }
}
