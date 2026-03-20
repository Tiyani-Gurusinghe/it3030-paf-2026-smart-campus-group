package lk.sliit.smartcampus.ticket.repository;


import lk.sliit.smartcampus.ticket.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TicketRepository extends JpaRepository<Ticket, Long> {
}