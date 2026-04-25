package lk.sliit.smartcampus.notification.controller;

import jakarta.validation.Valid;
import lk.sliit.smartcampus.notification.dto.NotificationPreferenceResponse;
import lk.sliit.smartcampus.notification.dto.NotificationPreferenceUpdateRequest;
import lk.sliit.smartcampus.notification.entity.Notification;
import lk.sliit.smartcampus.notification.entity.NotificationType;
import lk.sliit.smartcampus.notification.service.NotificationPreferenceService;
import lk.sliit.smartcampus.notification.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import lk.sliit.smartcampus.notification.dto.NotificationRequest;

@RestController
@RequestMapping("/api/v1/notifications")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class NotificationController {

    private final NotificationService notificationService;
    private final NotificationPreferenceService notificationPreferenceService;

    public NotificationController(NotificationService notificationService,
                                  NotificationPreferenceService notificationPreferenceService) {
        this.notificationService = notificationService;
        this.notificationPreferenceService = notificationPreferenceService;
    }

    @GetMapping
    public ResponseEntity<List<Notification>> getNotifications(@RequestParam Long userId) {
        return ResponseEntity.ok(notificationService.getNotificationsForUser(userId));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@RequestParam Long userId) {
        long count = notificationService.getUnreadCount(userId);
        return ResponseEntity.ok(Map.of("unreadCount", count));
    }

    @PatchMapping("/mark-read")
    public ResponseEntity<Void> markAllRead(@RequestParam Long userId) {
        notificationService.markAllRead(userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping
    public ResponseEntity<Notification> createNotification(@RequestBody NotificationRequest request) {
        Notification notification = notificationService.createNotification(
                request.getUserId(),
                request.getType(),
                request.getTitle(),
                request.getMessage(),
                request.getReferenceId()
        );
        return ResponseEntity.ok(notification);
    @GetMapping("/preferences")
    public ResponseEntity<List<NotificationPreferenceResponse>> getPreferences(
            @RequestHeader("X-User-Id") Long currentUserId,
            @RequestParam(required = false) Long userId) {
        return ResponseEntity.ok(notificationPreferenceService.getPreferences(currentUserId, userId));
    }

    @PatchMapping("/preferences/{type}")
    public ResponseEntity<NotificationPreferenceResponse> updatePreference(
            @RequestHeader("X-User-Id") Long currentUserId,
            @PathVariable NotificationType type,
            @RequestParam(required = false) Long userId,
            @Valid @RequestBody NotificationPreferenceUpdateRequest request) {
        return ResponseEntity.ok(
                notificationPreferenceService.updatePreference(
                        currentUserId,
                        userId,
                        type,
                        request.getEnabled()
                )
        );
    }
}
