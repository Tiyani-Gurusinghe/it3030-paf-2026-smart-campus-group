package lk.sliit.smartcampus.admin.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public record AdminDashboardSummaryDto(
        TicketStats ticketStats,
        BookingStats bookingStats,
        ResourceStats resourceStats,
        UserStats userStats,
        List<RecentTicket> recentTickets,
        List<RecentBooking> recentBookings
) {
    public record TicketStats(
            long total,
            long unassigned,
            long overdue,
            Map<String, Long> byStatus
    ) {
    }

    public record BookingStats(
            long total,
            long pending,
            Map<String, Long> byStatus
    ) {
    }

    public record ResourceStats(
            long total,
            long active,
            long outOfService,
            long underMaintenance,
            Map<String, Long> byStatus
    ) {
    }

    public record UserStats(
            long total,
            long admins,
            long technicians,
            long users
    ) {
    }

    public record RecentTicket(
            Long id,
            String title,
            String status,
            String priority,
            LocalDateTime createdAt,
            LocalDateTime dueAt
    ) {
    }

    public record RecentBooking(
            Long id,
            String resourceName,
            String userName,
            String status,
            LocalDateTime startTime,
            LocalDateTime endTime,
            LocalDateTime createdAt
    ) {
    }
}
