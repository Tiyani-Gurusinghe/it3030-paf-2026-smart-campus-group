package lk.sliit.smartcampus.ticket.repository;

import lk.sliit.smartcampus.ticket.entity.TicketAssignmentHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TicketAssignmentHistoryRepository extends JpaRepository<TicketAssignmentHistory, Long> {

    List<TicketAssignmentHistory> findByTicketId(Long ticketId);
}