package lk.sliit.smartcampus.ticket.repository;

import lk.sliit.smartcampus.ticket.entity.Ticket;
import lk.sliit.smartcampus.ticket.entity.TicketPriority;
import lk.sliit.smartcampus.ticket.entity.TicketStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface TicketRepository extends JpaRepository<Ticket, Long> {

    @Query("""
           SELECT t FROM Ticket t
           WHERE (:status IS NULL OR t.status = :status)
             AND (:priority IS NULL OR t.priority = :priority)
             AND (:reportedBy IS NULL OR t.reportedBy = :reportedBy)
           ORDER BY t.createdAt DESC
           """)
    List<Ticket> findWithFilters(
            @Param("status") TicketStatus status,
            @Param("priority") TicketPriority priority,
            @Param("reportedBy") Long reportedBy
    );

    @Query("""
           SELECT t FROM Ticket t
           WHERE (:status IS NULL OR t.status = :status)
             AND (:priority IS NULL OR t.priority = :priority)
             AND (:reportedBy IS NULL OR t.reportedBy = :reportedBy)
           """)
    Page<Ticket> findWithFilters(
            @Param("status") TicketStatus status,
            @Param("priority") TicketPriority priority,
            @Param("reportedBy") Long reportedBy,
            Pageable pageable
    );

    List<Ticket> findByAssignedToOrderByCreatedAtDesc(Long assignedTo);

    Page<Ticket> findByAssignedTo(Long assignedTo, Pageable pageable);

    List<Ticket> findByReportedByOrderByCreatedAtDesc(Long reportedBy);

    Page<Ticket> findByReportedBy(Long reportedBy, Pageable pageable);

    List<Ticket> findByResourceId(Long resourceId);

    void deleteByResourceId(Long resourceId);

    long countByResourceId(Long resourceId);

    long countByResourceIdAndStatusIn(Long resourceId, List<TicketStatus> statuses);

    long countByResourceIdAndCreatedAtAfter(Long resourceId, LocalDateTime time);

    long countByResourceIdAndResolvedAtAfter(Long resourceId, LocalDateTime time);

    long countByAssignedToAndStatusIn(Long assignedTo, List<TicketStatus> statuses);

    List<Ticket> findByAssignedToAndStatusInOrderByCreatedAtDesc(Long assignedTo, List<TicketStatus> statuses);

    List<Ticket> findByAssignedToIsNullOrderByCreatedAtDesc();

    List<Ticket> findByDueAtBeforeAndStatusInOrderByDueAtAsc(LocalDateTime time, List<TicketStatus> statuses);

    long countByStatus(TicketStatus status);

    long countByAssignedToIsNull();

    long countByDueAtBeforeAndStatusIn(LocalDateTime time, List<TicketStatus> statuses);

    List<Ticket> findTop5ByOrderByCreatedAtDesc();
}
