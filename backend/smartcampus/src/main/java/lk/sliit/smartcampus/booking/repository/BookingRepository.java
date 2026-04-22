package lk.sliit.smartcampus.booking.repository;

import lk.sliit.smartcampus.booking.entity.Booking;
import lk.sliit.smartcampus.booking.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByUserId(Long userId);

    List<Booking> findByResourceId(Long resourceId);

    // Check for overlapping bookings for a specific resource
    // An overlap occurs if a booking exists with a start time before the new end time 
    // AND an end time after the new start time, AND the status is not REJECTED or CANCELLED.
    @Query("SELECT COUNT(b) > 0 FROM Booking b WHERE b.resource.id = :resourceId " +
           "AND b.status NOT IN ('REJECTED', 'CANCELLED') " +
           "AND b.startTime < :endTime AND b.endTime > :startTime")
    boolean existsOverlappingBooking(
            @Param("resourceId") Long resourceId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime);

    @Query("SELECT COUNT(b) > 0 FROM Booking b WHERE b.resource.id = :resourceId " +
           "AND b.id != :bookingId " +
           "AND b.status NOT IN ('REJECTED', 'CANCELLED') " +
           "AND b.startTime < :endTime AND b.endTime > :startTime")
    boolean existsOverlappingBookingExcludingId(
            @Param("resourceId") Long resourceId,
            @Param("bookingId") Long bookingId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime);
}
