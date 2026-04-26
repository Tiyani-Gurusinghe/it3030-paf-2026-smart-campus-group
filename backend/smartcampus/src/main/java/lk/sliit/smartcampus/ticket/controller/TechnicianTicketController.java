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
@RequestMapping("/api/v1/technician/tickets")
public class TechnicianTicketController {

    private final TicketService ticketService;
    private final AuthenticatedUserService authenticatedUserService;

    public TechnicianTicketController(TicketService ticketService, AuthenticatedUserService authenticatedUserService) {
        this.ticketService = ticketService;
        this.authenticatedUserService = authenticatedUserService;
    }

    @GetMapping
    public ResponseEntity<PageResponse<TicketResponse>> getTechnicianTickets(
            Authentication authentication,
            @RequestParam(required = false) TicketStatus status,
            @RequestParam(required = false, defaultValue = "false") boolean overdue,
            @RequestParam(required = false, defaultValue = "false") boolean dueSoon,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Long technicianUserId = authenticatedUserService.getCurrentUserId(authentication);
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .header(HttpHeaders.PRAGMA, "no-cache")
                .body(PageResponse.from(
                        ticketService.getTechnicianTickets(technicianUserId, status, overdue, dueSoon, page, size)
                ));
    }
}
