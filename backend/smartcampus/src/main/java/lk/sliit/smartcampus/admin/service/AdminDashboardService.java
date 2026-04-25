package lk.sliit.smartcampus.admin.service;

import lk.sliit.smartcampus.admin.dto.AdminDashboardSummaryDto;
import lk.sliit.smartcampus.booking.entity.Booking;
import lk.sliit.smartcampus.booking.enums.BookingStatus;
import lk.sliit.smartcampus.booking.repository.BookingRepository;
import lk.sliit.smartcampus.common.enums.RoleType;
import lk.sliit.smartcampus.resource.enums.ResourceStatus;
import lk.sliit.smartcampus.resource.repository.ResourceRepository;
import lk.sliit.smartcampus.ticket.entity.Ticket;
import lk.sliit.smartcampus.ticket.entity.TicketStatus;
import lk.sliit.smartcampus.ticket.repository.TicketRepository;
import lk.sliit.smartcampus.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AdminDashboardService {

    private final TicketRepository ticketRepository;
    private final BookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;
    private final UserRepository userRepository;

    public AdminDashboardService(
            TicketRepository ticketRepository,
            BookingRepository bookingRepository,
            ResourceRepository resourceRepository,
            UserRepository userRepository
    ) {
        this.ticketRepository = ticketRepository;
        this.bookingRepository = bookingRepository;
        this.resourceRepository = resourceRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public AdminDashboardSummaryDto getSummary() {
        return new AdminDashboardSummaryDto(
                buildTicketStats(),
                buildBookingStats(),
                buildResourceStats(),
                buildUserStats(),
                buildRecentTickets(),
                buildRecentBookings()
        );
    }

    private AdminDashboardSummaryDto.TicketStats buildTicketStats() {
        Map<String, Long> byStatus = toStringKeyedMap(countTicketStatuses());
        long total = byStatus.values().stream().mapToLong(Long::longValue).sum();
        long overdue = ticketRepository.countByDueAtBeforeAndStatusIn(
                LocalDateTime.now(),
                List.of(TicketStatus.OPEN, TicketStatus.IN_PROGRESS)
        );

        return new AdminDashboardSummaryDto.TicketStats(
                total,
                ticketRepository.countByAssignedToIsNull(),
                overdue,
                byStatus
        );
    }

    private AdminDashboardSummaryDto.BookingStats buildBookingStats() {
        Map<String, Long> byStatus = toStringKeyedMap(countBookingStatuses());
        long total = byStatus.values().stream().mapToLong(Long::longValue).sum();

        return new AdminDashboardSummaryDto.BookingStats(
                total,
                byStatus.getOrDefault(BookingStatus.PENDING.name(), 0L),
                byStatus
        );
    }

    private AdminDashboardSummaryDto.ResourceStats buildResourceStats() {
        Map<String, Long> byStatus = toStringKeyedMap(countResourceStatuses());
        long total = byStatus.values().stream().mapToLong(Long::longValue).sum();

        return new AdminDashboardSummaryDto.ResourceStats(
                total,
                byStatus.getOrDefault(ResourceStatus.ACTIVE.name(), 0L),
                byStatus.getOrDefault(ResourceStatus.OUT_OF_SERVICE.name(), 0L),
                byStatus.getOrDefault(ResourceStatus.UNDER_MAINTENANCE.name(), 0L),
                byStatus
        );
    }

    private AdminDashboardSummaryDto.UserStats buildUserStats() {
        return new AdminDashboardSummaryDto.UserStats(
                userRepository.count(),
                userRepository.countUsersByRole(RoleType.ADMIN),
                userRepository.countUsersByRole(RoleType.TECHNICIAN),
                userRepository.countUsersByRole(RoleType.USER)
        );
    }

    private List<AdminDashboardSummaryDto.RecentTicket> buildRecentTickets() {
        return ticketRepository.findTop5ByOrderByCreatedAtDesc().stream()
                .map(this::mapRecentTicket)
                .collect(Collectors.toList());
    }

    private List<AdminDashboardSummaryDto.RecentBooking> buildRecentBookings() {
        return bookingRepository.findTop5ByOrderByCreatedAtDesc().stream()
                .map(this::mapRecentBooking)
                .collect(Collectors.toList());
    }

    private AdminDashboardSummaryDto.RecentTicket mapRecentTicket(Ticket ticket) {
        return new AdminDashboardSummaryDto.RecentTicket(
                ticket.getId(),
                ticket.getTitle(),
                ticket.getStatus().name(),
                ticket.getPriority().name(),
                ticket.getCreatedAt(),
                ticket.getDueAt()
        );
    }

    private AdminDashboardSummaryDto.RecentBooking mapRecentBooking(Booking booking) {
        return new AdminDashboardSummaryDto.RecentBooking(
                booking.getId(),
                booking.getResource().getName(),
                booking.getUser().getFullName(),
                booking.getStatus().name(),
                booking.getStartTime(),
                booking.getEndTime(),
                booking.getCreatedAt()
        );
    }

    private Map<TicketStatus, Long> countTicketStatuses() {
        Map<TicketStatus, Long> counts = new EnumMap<>(TicketStatus.class);
        for (TicketStatus status : TicketStatus.values()) {
            counts.put(status, ticketRepository.countByStatus(status));
        }
        return counts;
    }

    private Map<BookingStatus, Long> countBookingStatuses() {
        Map<BookingStatus, Long> counts = new EnumMap<>(BookingStatus.class);
        for (BookingStatus status : BookingStatus.values()) {
            counts.put(status, bookingRepository.countByStatus(status));
        }
        return counts;
    }

    private Map<ResourceStatus, Long> countResourceStatuses() {
        Map<ResourceStatus, Long> counts = new EnumMap<>(ResourceStatus.class);
        for (ResourceStatus status : ResourceStatus.values()) {
            counts.put(status, resourceRepository.countByStatus(status));
        }
        return counts;
    }

    private <E extends Enum<E>> Map<String, Long> toStringKeyedMap(Map<E, Long> source) {
        return source.entrySet().stream()
                .collect(Collectors.toMap(entry -> entry.getKey().name(), Map.Entry::getValue));
    }
}
