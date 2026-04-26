package lk.sliit.smartcampus.notification.dto;

import lk.sliit.smartcampus.notification.entity.NotificationType;

public class NotificationPreferenceResponse {
    private NotificationType type;
    private boolean enabled;

    public NotificationPreferenceResponse() {
    }

    public NotificationPreferenceResponse(NotificationType type, boolean enabled) {
        this.type = type;
        this.enabled = enabled;
    }

    public NotificationType getType() {
        return type;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setType(NotificationType type) {
        this.type = type;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }
}
