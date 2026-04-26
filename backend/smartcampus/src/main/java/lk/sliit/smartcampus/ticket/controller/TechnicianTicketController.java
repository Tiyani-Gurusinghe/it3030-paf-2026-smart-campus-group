package lk.sliit.smartcampus.ticket.controller;

import lk.sliit.smartcampus.auth.service.AuthenticatedUserService;
import lk.sliit.smartcampus.ticket.dto.PageResponse;
import lk.sliit.smartcampus.ticket.dto.TicketResponse;
import lk.sliit.smartcampus.ticket.entity.TicketStatus;
import lk.sliit.smartcampus.ticket.service.TicketService;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
// REST resource base path: technician ticket views are grouped under /api/v1/technician/tickets.
@RequestMapping("/api/v1/technician/tickets")
public class TechnicianTicketController {

    private final TicketService ticketService;
    private final AuthenticatedUserService authenticatedUserService;

    public TechnicianTicketController(TicketService ticketService, AuthenticatedUserService authenticatedUserService) {
        this.ticketService = ticketService;
        this.authenticatedUserService = authenticatedUserService;
    }

    // GET reads tickets assigned to the authenticated technician.
    @GetMapping
    public ResponseEntity<PageResponse<TicketResponse>> getTechnicianTickets(
            // Authentication comes from the stateless JWT sent with this request.
            Authentication authentication,
            @RequestParam(required = false) TicketStatus status,
            @RequestParam(required = false, defaultValue = "false") boolean overdue,
            @RequestParam(required = false, defaultValue = "false") boolean dueSoon,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Long technicianUserId = authenticatedUserService.getCurrentUserId(authentication);
        // 200 OK: successful read with a response body.
        return ResponseEntity.ok()
                // no-store: prevents private ticket data from being cached by browser/proxy.
                .cacheControl(CacheControl.noStore())
                .header(HttpHeaders.PRAGMA, "no-cache")
                .body(PageResponse.from(
                        ticketService.getTechnicianTickets(technicianUserId, status, overdue, dueSoon, page, size)
                ));
    }
}
