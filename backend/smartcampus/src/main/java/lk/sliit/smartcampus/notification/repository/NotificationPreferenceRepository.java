package lk.sliit.smartcampus.notification.repository;

import lk.sliit.smartcampus.notification.entity.NotificationPreference;
import lk.sliit.smartcampus.notification.entity.NotificationType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface NotificationPreferenceRepository extends JpaRepository<NotificationPreference, Long> {
    Optional<NotificationPreference> findByUserIdAndType(Long userId, NotificationType type);

    List<NotificationPreference> findByUserIdOrderByTypeAsc(Long userId);
}
