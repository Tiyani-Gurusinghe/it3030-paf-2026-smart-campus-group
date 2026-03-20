package lk.sliit.smartcampus.ticket.controller;

import jakarta.validation.Valid;
import lk.sliit.smartcampus.ticket.dto.TicketRequest;
import lk.sliit.smartcampus.ticket.dto.TicketStatusUpdateRequest;
import lk.sliit.smartcampus.ticket.entity.Ticket;
import lk.sliit.smartcampus.ticket.service.TicketService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tickets")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @GetMapping
    public ResponseEntity<List<Ticket>> getAllTickets() {
        return ResponseEntity.ok(ticketService.getAllTickets());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Ticket> getTicketById(@PathVariable Long id) {
        return ResponseEntity.ok(ticketService.getTicketById(id));
    }

    @PostMapping
    public ResponseEntity<Ticket> createTicket(@Valid @RequestBody TicketRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ticketService.createTicket(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Ticket> updateTicket(@PathVariable Long id, @Valid @RequestBody TicketRequest request) {
        return ResponseEntity.ok(ticketService.updateTicket(id, request));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Ticket> updateTicketStatus(
            @PathVariable Long id,
            @Valid @RequestBody TicketStatusUpdateRequest request
    ) {
        return ResponseEntity.ok(ticketService.updateTicketStatus(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTicket(@PathVariable Long id) {
        ticketService.deleteTicket(id);
        return ResponseEntity.noContent().build();
    }
}