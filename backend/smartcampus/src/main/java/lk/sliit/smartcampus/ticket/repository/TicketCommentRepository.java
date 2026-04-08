package lk.sliit.smartcampus.ticket.repository;

import lk.sliit.smartcampus.ticket.entity.TicketComment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TicketCommentRepository extends JpaRepository<TicketComment, Long> {
    List<TicketComment> findByTicketIdOrderByCreatedAtAsc(Long ticketId);
    long countByTicketId(Long ticketId);
}
