package lk.sliit.smartcampus.ticket.repository;

import lk.sliit.smartcampus.ticket.entity.Ticket;
import lk.sliit.smartcampus.ticket.entity.TicketPriority;
import lk.sliit.smartcampus.ticket.entity.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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

    List<Ticket> findByAssignedToOrderByCreatedAtDesc(Long assignedTo);

    List<Ticket> findByReportedByOrderByCreatedAtDesc(Long reportedBy);

    long countByAssignedToAndStatusIn(Long assignedTo, List<TicketStatus> statuses);

    List<Ticket> findByAssignedToAndStatusInOrderByCreatedAtDesc(Long assignedTo, List<TicketStatus> statuses);

    List<Ticket> findByAssignedToIsNullOrderByCreatedAtDesc();

    List<Ticket> findByDueAtBeforeAndStatusInOrderByDueAtAsc(java.time.LocalDateTime time, List<TicketStatus> statuses);
}