package lk.sliit.smartcampus.ticket.repository;

import lk.sliit.smartcampus.ticket.entity.TicketHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TicketHistoryRepository extends JpaRepository<TicketHistory, Long> {

    List<TicketHistory> findByTicketIdOrderByCreatedAtAsc(Long ticketId);

    long countByTicketIdAndActionType(Long ticketId, String actionType);

    void deleteByTicketIdIn(List<Long> ticketIds);
}
