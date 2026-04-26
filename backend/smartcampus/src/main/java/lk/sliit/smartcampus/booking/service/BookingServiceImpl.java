package lk.sliit.smartcampus.booking.service;
import lk.sliit.smartcampus.booking.dto.BookingRequestDto;
import lk.sliit.smartcampus.booking.dto.BookingResponseDto;
import lk.sliit.smartcampus.booking.entity.Booking;
import lk.sliit.smartcampus.booking.enums.BookingStatus;
import lk.sliit.smartcampus.booking.repository.BookingRepository;
import lk.sliit.smartcampus.exception.ResourceNotFoundException;
import lk.sliit.smartcampus.exception.ConflictException;
import lk.sliit.smartcampus.resource.entity.Resource;
import lk.sliit.smartcampus.resource.enums.ResourceCategory;
import lk.sliit.smartcampus.resource.enums.ResourceStatus;
import lk.sliit.smartcampus.resource.repository.ResourceRepository;
import lk.sliit.smartcampus.user.entity.User;
import lk.sliit.smartcampus.user.repository.UserRepository;
import lk.sliit.smartcampus.notification.entity.NotificationType;
import lk.sliit.smartcampus.notification.service.NotificationService;
import lk.sliit.smartcampus.common.enums.RoleType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public BookingServiceImpl(BookingRepository bookingRepository, 
                              ResourceRepository resourceRepository, 
                              UserRepository userRepository,
                              NotificationService notificationService) {
        this.bookingRepository = bookingRepository;
        this.resourceRepository = resourceRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    @Override
    @Transactional
    public BookingResponseDto createBooking(BookingRequestDto requestDto) {
        // Validate User
        User user = userRepository.findById(requestDto.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + requestDto.getUserId()));

        // Validate Resource
        Resource resource = resourceRepository.findById(requestDto.getResourceId())
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + requestDto.getResourceId()));

        if (resource.getStatus() != ResourceStatus.ACTIVE) {
            throw new ConflictException("Cannot book an inactive resource");
        }
        validateBookableResource(resource);

        if (requestDto.getStartTime().isAfter(requestDto.getEndTime())) {
            throw new ConflictException("Start time must be before end time");
        }
        validateTimeRules(requestDto.getStartTime(), requestDto.getEndTime());

        int quantity = resolveQuantity(resource, requestDto.getQuantity());
        validateAvailability(resource, quantity, requestDto.getStartTime(), requestDto.getEndTime(), null);

        Booking booking = new Booking();
        booking.setResource(resource);
        booking.setUser(user);
        booking.setStartTime(requestDto.getStartTime());
        booking.setEndTime(requestDto.getEndTime());
        booking.setQuantity(quantity);
        booking.setPurpose(requestDto.getPurpose());
        booking.setBookingDate(requestDto.getBookingDate());
        booking.setStatus(BookingStatus.PENDING); // Default status

        Booking savedBooking = bookingRepository.save(booking);

        List<Long> adminIds = userRepository.findUserIdsByRoleType(RoleType.ADMIN);
        if (adminIds != null) {
            for (Long adminId : adminIds) {
                notificationService.createNotification(
                        adminId,
                        NotificationType.NEW_BOOKING,
                        "New Booking Request",
                        "A new booking request for " + resource.getName() + " has been submitted by " + user.getFullName() + ".",
                        savedBooking.getId()
                );
            }
        }

        return mapToDto(savedBooking);
    }

    @Override
    public BookingResponseDto getBookingById(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));
        return mapToDto(booking);
    }

    @Override
    public List<BookingResponseDto> getAllBookings() {
        return bookingRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<BookingResponseDto> getBookingsByUserId(Long userId) {
        return bookingRepository.findByUserId(userId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<BookingResponseDto> getBookingsByResourceId(Long resourceId) {
        return bookingRepository.findByResourceId(resourceId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public int getAvailableQuantity(Long resourceId, LocalDateTime startTime, LocalDateTime endTime, Long excludingBookingId) {
        Resource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + resourceId));
        validateBookableResource(resource);

        if (startTime.isAfter(endTime)) {
            throw new ConflictException("Start time must be before end time");
        }
        validateTimeRules(startTime, endTime);

        if (!isInventory(resource)) {
            boolean isOverlapping = excludingBookingId == null
                    ? bookingRepository.existsOverlappingBooking(resourceId, startTime, endTime)
                    : bookingRepository.existsOverlappingBookingExcludingId(resourceId, excludingBookingId, startTime, endTime);
            return isOverlapping ? 0 : 1;
        }

        int totalQuantity = resource.getCapacity() == null ? 1 : resource.getCapacity();
        long bookedQuantity = excludingBookingId == null
                ? bookingRepository.sumOverlappingQuantity(resourceId, startTime, endTime)
                : bookingRepository.sumOverlappingQuantityExcludingId(resourceId, excludingBookingId, startTime, endTime);

        return (int) Math.max(totalQuantity - bookedQuantity, 0);
    }

    @Override
    @Transactional
    public BookingResponseDto updateBookingStatus(Long id, BookingStatus status) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));

        booking.setStatus(status);
        Booking updatedBooking = bookingRepository.save(booking);

        if (status == BookingStatus.APPROVED) {
            notificationService.createNotification(
                    booking.getUser().getId(),
                    NotificationType.BOOKING_APPROVED,
                    "Booking Approved",
                    "Your booking request for " + booking.getResource().getName() + " has been approved.",
                    booking.getId()
            );
        } else if (status == BookingStatus.REJECTED) {
            notificationService.createNotification(
                    booking.getUser().getId(),
                    NotificationType.BOOKING_REJECTED,
                    "Booking Rejected",
                    "Your booking request for " + booking.getResource().getName() + " has been rejected.",
                    booking.getId()
            );
        }

        return mapToDto(updatedBooking);
    }

    @Override
    @Transactional
    public BookingResponseDto updateBooking(Long id, BookingRequestDto requestDto) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));

        User user = userRepository.findById(requestDto.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + requestDto.getUserId()));

        Resource resource = resourceRepository.findById(requestDto.getResourceId())
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + requestDto.getResourceId()));

        if (resource.getStatus() != ResourceStatus.ACTIVE) {
            throw new ConflictException("Cannot book an inactive resource");
        }
        validateBookableResource(resource);

        if (requestDto.getStartTime().isAfter(requestDto.getEndTime())) {
            throw new ConflictException("Start time must be before end time");
        }
        validateTimeRules(requestDto.getStartTime(), requestDto.getEndTime());

        int quantity = resolveQuantity(resource, requestDto.getQuantity());
        validateAvailability(resource, quantity, requestDto.getStartTime(), requestDto.getEndTime(), id);

        booking.setResource(resource);
        booking.setUser(user);
        booking.setStartTime(requestDto.getStartTime());
        booking.setEndTime(requestDto.getEndTime());
        booking.setQuantity(quantity);
        booking.setPurpose(requestDto.getPurpose());
        if (requestDto.getBookingDate() != null) {
            booking.setBookingDate(requestDto.getBookingDate());
        }

        Booking updatedBooking = bookingRepository.save(booking);
        return mapToDto(updatedBooking);
    }

    @Override
    @Transactional
    public void deleteBooking(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));
        bookingRepository.delete(booking);
    }

    // Helper method to map entity to DTO
    private BookingResponseDto mapToDto(Booking booking) {
        BookingResponseDto dto = new BookingResponseDto();
        dto.setId(booking.getId());
        dto.setResourceId(booking.getResource().getId());
        dto.setResourceName(booking.getResource().getName());
        dto.setUserId(booking.getUser().getId());
        dto.setUserName(booking.getUser().getFullName());
        dto.setStartTime(booking.getStartTime());
        dto.setEndTime(booking.getEndTime());
        dto.setQuantity(booking.getQuantity());
        dto.setPurpose(booking.getPurpose());
        dto.setStatus(booking.getStatus());
        dto.setCreatedAt(booking.getCreatedAt());
        dto.setUpdatedAt(booking.getUpdatedAt());
        return dto;
    }

    private int resolveQuantity(Resource resource, Integer requestedQuantity) {
        if (!isInventory(resource)) {
            return 1;
        }

        if (requestedQuantity == null || requestedQuantity < 1) {
            throw new ConflictException("Quantity must be at least 1 for inventory bookings");
        }

        int availableQuantity = resource.getCapacity() == null ? 1 : resource.getCapacity();
        if (requestedQuantity > availableQuantity) {
            throw new ConflictException("Requested quantity exceeds available inventory quantity");
        }

        return requestedQuantity;
    }

    private void validateAvailability(Resource resource, int quantity, LocalDateTime startTime, LocalDateTime endTime, Long excludingBookingId) {
        if (!isInventory(resource)) {
            boolean isOverlapping = excludingBookingId == null
                    ? bookingRepository.existsOverlappingBooking(resource.getId(), startTime, endTime)
                    : bookingRepository.existsOverlappingBookingExcludingId(resource.getId(), excludingBookingId, startTime, endTime);

            if (isOverlapping) {
                throw new ConflictException("The resource is already booked for the selected time period");
            }
            return;
        }

        int availableQuantity = resource.getCapacity() == null ? 1 : resource.getCapacity();
        long bookedQuantity = excludingBookingId == null
                ? bookingRepository.sumOverlappingQuantity(resource.getId(), startTime, endTime)
                : bookingRepository.sumOverlappingQuantityExcludingId(resource.getId(), excludingBookingId, startTime, endTime);

        if (bookedQuantity + quantity > availableQuantity) {
            long remaining = Math.max(availableQuantity - bookedQuantity, 0);
            throw new ConflictException("Only " + remaining + " item(s) are available for the selected time period");
        }
    }

    private boolean isInventory(Resource resource) {
        return resource.getCategory() == ResourceCategory.EQUIPMENT || resource.getCategory() == ResourceCategory.UTILITY;
    }

    private void validateBookableResource(Resource resource) {
        if (resource.getCategory() == ResourceCategory.BUILDING) {
            throw new ConflictException("Buildings are not directly bookable. Please choose a space or asset inside the building.");
        }
    }

    private void validateTimeRules(LocalDateTime startTime, LocalDateTime endTime) {
        if (startTime.getMinute() != 0 || startTime.getSecond() != 0 || startTime.getNano() != 0 ||
                endTime.getMinute() != 0 || endTime.getSecond() != 0 || endTime.getNano() != 0) {
            throw new ConflictException("Bookings must start and end on whole hours");
        }

        long minutes = Duration.between(startTime, endTime).toMinutes();
        if (minutes <= 0) {
            throw new ConflictException("Start time must be before end time");
        }
        if (minutes > 120) {
            throw new ConflictException("Bookings cannot be longer than 2 hours");
        }
    }
}
