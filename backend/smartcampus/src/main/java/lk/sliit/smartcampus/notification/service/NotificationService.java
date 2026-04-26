package lk.sliit.smartcampus.notification.service;

import lk.sliit.smartcampus.notification.entity.Notification;
import lk.sliit.smartcampus.notification.entity.NotificationType;
import lk.sliit.smartcampus.notification.repository.NotificationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationPreferenceService notificationPreferenceService;

    public NotificationService(NotificationRepository notificationRepository,
                               NotificationPreferenceService notificationPreferenceService) {
        this.notificationRepository = notificationRepository;
        this.notificationPreferenceService = notificationPreferenceService;
    }

    public Notification createNotification(Long userId, NotificationType type, String title, String message, Long referenceId) {
        if (userId == null) return null;
        if (!notificationPreferenceService.isEnabled(userId, type)) {
            return null;
        }
        Notification n = new Notification();
        n.setUserId(userId);
        n.setType(type);
        n.setTitle(title);
        n.setMessage(message);
        
        if (type == NotificationType.NEW_BOOKING || type == NotificationType.BOOKING_APPROVED || type == NotificationType.BOOKING_REJECTED) {
            n.setBookingId(referenceId);
        } else {
            n.setTicketId(referenceId);
        }
        n.setRead(false);
        return notificationRepository.save(n);
    }

    public List<Notification> getNotificationsForUser(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    public void markAllRead(Long userId) {
        notificationRepository.markAllReadByUserId(userId);
    }
}
