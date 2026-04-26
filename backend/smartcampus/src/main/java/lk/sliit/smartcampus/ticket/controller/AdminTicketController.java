package lk.sliit.smartcampus.ticket.controller;

import jakarta.validation.Valid;
import lk.sliit.smartcampus.auth.service.AuthenticatedUserService;
import lk.sliit.smartcampus.ticket.dto.TicketAssignRequest;
import lk.sliit.smartcampus.ticket.dto.TicketResponse;
import lk.sliit.smartcampus.ticket.dto.TechnicianOptionResponse;
import lk.sliit.smartcampus.ticket.service.TicketService;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/tickets")
public class AdminTicketController {

    private final TicketService ticketService;
    private final AuthenticatedUserService authenticatedUserService;

    public AdminTicketController(TicketService ticketService, AuthenticatedUserService authenticatedUserService) {
        this.ticketService = ticketService;
        this.authenticatedUserService = authenticatedUserService;
    }

    @GetMapping("/{id}/technicians")
    public ResponseEntity<List<TechnicianOptionResponse>> getAssignableTechnicians(
            @PathVariable Long id,
            Authentication authentication) {
        Long currentUserId = authenticatedUserService.getCurrentUserId(authentication);
        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(Duration.ofMinutes(2)).cachePrivate())
                .body(ticketService.getAssignableTechnicians(id, currentUserId));
    }

    @PatchMapping("/{id}/assignment")
    public ResponseEntity<TicketResponse> assignTicket(
            @PathVariable Long id,
            Authentication authentication,
            @Valid @RequestBody TicketAssignRequest request) {
        Long currentUserId = authenticatedUserService.getCurrentUserId(authentication);
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .header(HttpHeaders.PRAGMA, "no-cache")
                .body(ticketService.assignTicket(id, currentUserId, request));
    }
}
