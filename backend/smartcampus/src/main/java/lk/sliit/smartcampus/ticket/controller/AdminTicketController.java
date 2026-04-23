package lk.sliit.smartcampus.ticket.controller;

import jakarta.validation.Valid;
import lk.sliit.smartcampus.ticket.dto.TicketAssignRequest;
import lk.sliit.smartcampus.ticket.dto.TicketResponse;
import lk.sliit.smartcampus.ticket.dto.TechnicianOptionResponse;
import lk.sliit.smartcampus.ticket.dto.TicketStatusUpdateRequest;
import lk.sliit.smartcampus.ticket.service.TicketService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/tickets")
public class AdminTicketController {

    private final TicketService ticketService;

    public AdminTicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @GetMapping("/{id}/technicians")
    public ResponseEntity<List<TechnicianOptionResponse>> getAssignableTechnicians(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long currentUserId) {
        return ResponseEntity.ok(ticketService.getAssignableTechnicians(id, currentUserId));
    }

    @PatchMapping("/{id}/assignment")
    public ResponseEntity<TicketResponse> assignTicket(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long currentUserId,
            @Valid @RequestBody TicketAssignRequest request) {
        return ResponseEntity.ok(ticketService.assignTicket(id, currentUserId, request));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<TicketResponse> updateTicketStatus(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long currentUserId,
            @Valid @RequestBody TicketStatusUpdateRequest request) {
        return ResponseEntity.ok(ticketService.updateStatus(id, request, currentUserId));
    }
}
