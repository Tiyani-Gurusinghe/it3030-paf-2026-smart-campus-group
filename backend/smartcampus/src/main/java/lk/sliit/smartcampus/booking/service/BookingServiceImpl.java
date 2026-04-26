package lk.sliit.smartcampus.booking.service;
import lk.sliit.smartcampus.booking.dto.BookingRequestDto;
import lk.sliit.smartcampus.booking.dto.BookingResponseDto;
import lk.sliit.smartcampus.booking.entity.Booking;
import lk.sliit.smartcampus.booking.enums.BookingStatus;
import lk.sliit.smartcampus.booking.repository.BookingRepository;
import lk.sliit.smartcampus.exception.ResourceNotFoundException;
import lk.sliit.smartcampus.exception.ConflictException;
import lk.sliit.smartcampus.resource.entity.Resource;
import lk.sliit.smartcampus.resource.enums.ResourceStatus;
import lk.sliit.smartcampus.resource.repository.ResourceRepository;
import lk.sliit.smartcampus.user.entity.User;
import lk.sliit.smartcampus.user.repository.UserRepository;
import lk.sliit.smartcampus.notification.entity.NotificationType;
import lk.sliit.smartcampus.notification.service.NotificationService;
import lk.sliit.smartcampus.common.enums.RoleType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

        if (requestDto.getStartTime().isAfter(requestDto.getEndTime())) {
            throw new ConflictException("Start time must be before end time");
        }

        // Check for time conflicts
        boolean isOverlapping = bookingRepository.existsOverlappingBooking(
                requestDto.getResourceId(), 
                requestDto.getStartTime(), 
                requestDto.getEndTime()
        );

        if (isOverlapping) {
            throw new ConflictException("The resource is already booked for the selected time period");
        }

        Booking booking = new Booking();
        booking.setResource(resource);
        booking.setUser(user);
        booking.setStartTime(requestDto.getStartTime());
        booking.setEndTime(requestDto.getEndTime());
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

        if (requestDto.getStartTime().isAfter(requestDto.getEndTime())) {
            throw new ConflictException("Start time must be before end time");
        }

        boolean isOverlapping = bookingRepository.existsOverlappingBookingExcludingId(
                requestDto.getResourceId(),
                id,
                requestDto.getStartTime(),
                requestDto.getEndTime()
        );

        if (isOverlapping) {
            throw new ConflictException("The resource is already booked for the selected time period");
        }

        booking.setResource(resource);
        booking.setUser(user);
        booking.setStartTime(requestDto.getStartTime());
        booking.setEndTime(requestDto.getEndTime());
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
        dto.setPurpose(booking.getPurpose());
        dto.setStatus(booking.getStatus());
        dto.setCreatedAt(booking.getCreatedAt());
        dto.setUpdatedAt(booking.getUpdatedAt());
        return dto;
    }
}