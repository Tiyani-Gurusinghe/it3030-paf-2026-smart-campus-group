package lk.sliit.smartcampus.notification.service;

import lk.sliit.smartcampus.common.enums.RoleType;
import lk.sliit.smartcampus.exception.ResourceNotFoundException;
import lk.sliit.smartcampus.exception.UnauthorizedException;
import lk.sliit.smartcampus.notification.dto.NotificationPreferenceResponse;
import lk.sliit.smartcampus.notification.entity.NotificationPreference;
import lk.sliit.smartcampus.notification.entity.NotificationType;
import lk.sliit.smartcampus.notification.repository.NotificationPreferenceRepository;
import lk.sliit.smartcampus.user.entity.User;
import lk.sliit.smartcampus.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class NotificationPreferenceService {

    private final NotificationPreferenceRepository preferenceRepository;
    private final UserRepository userRepository;

    public NotificationPreferenceService(NotificationPreferenceRepository preferenceRepository,
                                         UserRepository userRepository) {
        this.preferenceRepository = preferenceRepository;
        this.userRepository = userRepository;
    }

    public boolean isEnabled(Long userId, NotificationType type) {
        return preferenceRepository.findByUserIdAndType(userId, type)
                .map(NotificationPreference::isEnabled)
                .orElse(true);
    }

    public List<NotificationPreferenceResponse> getPreferences(Long currentUserId, Long targetUserId) {
        User currentUser = findUserByIdOrThrow(currentUserId);
        Long effectiveTarget = targetUserId == null ? currentUserId : targetUserId;

        if (!effectiveTarget.equals(currentUserId) && !currentUser.hasRole(RoleType.ADMIN)) {
            throw new UnauthorizedException("Only admin can view another user's preferences");
        }

        Map<NotificationType, Boolean> configured = preferenceRepository.findByUserIdOrderByTypeAsc(effectiveTarget)
                .stream()
                .collect(Collectors.toMap(NotificationPreference::getType, NotificationPreference::isEnabled));

        return Arrays.stream(NotificationType.values())
                .map(type -> new NotificationPreferenceResponse(type, configured.getOrDefault(type, true)))
                .sorted(Comparator.comparing(item -> item.getType().name()))
                .toList();
    }

    @Transactional
    public NotificationPreferenceResponse updatePreference(Long currentUserId,
                                                           Long targetUserId,
                                                           NotificationType type,
                                                           boolean enabled) {
        User currentUser = findUserByIdOrThrow(currentUserId);
        Long effectiveTarget = targetUserId == null ? currentUserId : targetUserId;

        if (!effectiveTarget.equals(currentUserId) && !currentUser.hasRole(RoleType.ADMIN)) {
            throw new UnauthorizedException("Only admin can update another user's preferences");
        }

        NotificationPreference preference = preferenceRepository
                .findByUserIdAndType(effectiveTarget, type)
                .orElseGet(() -> {
                    NotificationPreference p = new NotificationPreference();
                    p.setUserId(effectiveTarget);
                    p.setType(type);
                    return p;
                });

        preference.setEnabled(enabled);
        NotificationPreference saved = preferenceRepository.save(preference);

        return new NotificationPreferenceResponse(saved.getType(), saved.isEnabled());
    }

    private User findUserByIdOrThrow(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
    }
}
