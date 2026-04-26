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
// REST resource base path: admin ticket actions are grouped under /api/v1/admin/tickets.
@RequestMapping("/api/v1/admin/tickets")
public class AdminTicketController {

    private final TicketService ticketService;
    private final AuthenticatedUserService authenticatedUserService;

    public AdminTicketController(TicketService ticketService, AuthenticatedUserService authenticatedUserService) {
        this.ticketService = ticketService;
        this.authenticatedUserService = authenticatedUserService;
    }

    // GET reads assignable technician lookup data for admin assignment.
    @GetMapping("/{id}/technicians")
    public ResponseEntity<List<TechnicianOptionResponse>> getAssignableTechnicians(
            @PathVariable Long id,
            // Authentication comes from the stateless JWT sent with this request.
            Authentication authentication) {
        Long currentUserId = authenticatedUserService.getCurrentUserId(authentication);
        // 200 OK: successful read with a response body.
        return ResponseEntity.ok()
                // max-age: technician options are cacheable briefly for this private user.
                .cacheControl(CacheControl.maxAge(Duration.ofMinutes(2)).cachePrivate())
                .body(ticketService.getAssignableTechnicians(id, currentUserId));
    }

    // PATCH partially updates the ticket assignment.
    @PatchMapping("/{id}/assignment")
    public ResponseEntity<TicketResponse> assignTicket(
            @PathVariable Long id,
            // Authentication comes from the stateless JWT sent with this request.
            Authentication authentication,
            // @Valid triggers DTO validation before service logic runs.
            @Valid @RequestBody TicketAssignRequest request) {
        Long currentUserId = authenticatedUserService.getCurrentUserId(authentication);
        // 200 OK: assignment update succeeded and returns the updated ticket.
        return ResponseEntity.ok()
                // no-store: prevents private ticket data from being cached by browser/proxy.
                .cacheControl(CacheControl.noStore())
                .header(HttpHeaders.PRAGMA, "no-cache")
                .body(ticketService.assignTicket(id, currentUserId, request));
    }
}
