package lk.sliit.smartcampus.ticket.controller;

import lk.sliit.smartcampus.ticket.dto.TicketResponse;
import lk.sliit.smartcampus.ticket.entity.TicketStatus;
import lk.sliit.smartcampus.ticket.service.TicketService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/technician/tickets")
public class TechnicianTicketController {

    private final TicketService ticketService;

    public TechnicianTicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @GetMapping
    public ResponseEntity<List<TicketResponse>> getTechnicianTickets(
            @RequestHeader("X-User-Id") Long technicianUserId,
            @RequestParam(required = false) TicketStatus status,
            @RequestParam(required = false, defaultValue = "false") boolean overdue,
            @RequestParam(required = false, defaultValue = "false") boolean dueSoon,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        return ResponseEntity.ok(
                ticketService.getTechnicianTickets(technicianUserId, status, overdue, dueSoon, page, size)
        );
    }
}