package lk.sliit.smartcampus.ticket.controller;

import jakarta.validation.Valid;
import lk.sliit.smartcampus.auth.service.AuthenticatedUserService;
import lk.sliit.smartcampus.ticket.dto.PageResponse;
import lk.sliit.smartcampus.ticket.dto.TicketCommentRequest;
import lk.sliit.smartcampus.ticket.dto.TicketCommentResponse;
import lk.sliit.smartcampus.ticket.dto.TicketDueDateUpdateRequest;
import lk.sliit.smartcampus.ticket.dto.TicketRequest;
import lk.sliit.smartcampus.ticket.dto.TicketResponse;
import lk.sliit.smartcampus.ticket.dto.SkillOptionResponse;
import lk.sliit.smartcampus.ticket.dto.TicketResolutionUpdateRequest;
import lk.sliit.smartcampus.ticket.dto.TechnicianOptionResponse;
import lk.sliit.smartcampus.ticket.dto.TicketAssignRequest;
import lk.sliit.smartcampus.ticket.dto.TicketScope;
import lk.sliit.smartcampus.ticket.dto.TicketStatusUpdateRequest;
import lk.sliit.smartcampus.ticket.entity.TicketPriority;
import lk.sliit.smartcampus.ticket.entity.TicketStatus;
import lk.sliit.smartcampus.ticket.service.TicketAttachmentService;
import lk.sliit.smartcampus.ticket.service.TicketCommentService;
import lk.sliit.smartcampus.ticket.service.TicketService;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.URI;
import java.time.Duration;
import java.util.List;

@RestController
// REST resource base path: all general ticket endpoints are grouped under /api/v1/tickets.
@RequestMapping("/api/v1/tickets")
public class TicketController {

    private final TicketService ticketService;
    private final TicketCommentService commentService;
    private final TicketAttachmentService attachmentService;
    private final AuthenticatedUserService authenticatedUserService;

    public TicketController(TicketService ticketService,
                            TicketCommentService commentService,
                            TicketAttachmentService attachmentService,
                            AuthenticatedUserService authenticatedUserService) {
        this.ticketService = ticketService;
        this.commentService = commentService;
        this.attachmentService = attachmentService;
        this.authenticatedUserService = authenticatedUserService;
    }

    // GET reads ticket resources without changing server state.
    @GetMapping
    public ResponseEntity<PageResponse<TicketResponse>> getAllTickets(
            // Authentication comes from the stateless JWT sent with this request.
            Authentication authentication,
            @RequestParam(defaultValue = "ALL") TicketScope scope,
            @RequestParam(required = false) TicketStatus status,
            @RequestParam(required = false) TicketPriority priority,
            @RequestParam(required = false) Long reportedBy,
            @RequestParam(required = false, defaultValue = "false") boolean overdue,
            @RequestParam(required = false, defaultValue = "false") boolean dueSoon,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Long currentUserId = authenticatedUserService.getCurrentUserId(authentication);
        return noStore(PageResponse.from(switch (scope) {
            case ALL -> ticketService.getAllTickets(currentUserId, status, priority, reportedBy, page, size);
            case MINE -> ticketService.getMyVisibleTickets(currentUserId, page, size);
            case REPORTED_BY_ME -> ticketService.getReportedTickets(currentUserId, page, size);
            case ASSIGNED_TO_ME -> ticketService.getTechnicianTickets(currentUserId, status, overdue, dueSoon, page, size);
        }));
    }

    // GET reads the authenticated user's ticket collection.
    @GetMapping("/my")
    public ResponseEntity<PageResponse<TicketResponse>> getMyTickets(
            // Authentication comes from the stateless JWT sent with this request.
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Long currentUserId = authenticatedUserService.getCurrentUserId(authentication);
        return noStore(PageResponse.from(ticketService.getMyVisibleTickets(currentUserId, page, size)));
    }

    // GET reads lookup data used by the ticket form.
    @GetMapping("/skills")
    public ResponseEntity<List<SkillOptionResponse>> getSkillsForResource(
            @RequestParam Long resourceId) {
        // 200 OK: successful read with a response body.
        return ResponseEntity.ok()
                // max-age: skill lookup data is safe to cache briefly.
                .cacheControl(CacheControl.maxAge(Duration.ofMinutes(5)).cachePublic())
                .body(ticketService.getSkillsForResource(resourceId));
    }

    // GET reads one ticket resource by id.
    @GetMapping("/{id}")
    public ResponseEntity<TicketResponse> getTicketById(
            @PathVariable Long id,
            // Authentication comes from the stateless JWT sent with this request.
            Authentication authentication) {
        Long currentUserId = authenticatedUserService.getCurrentUserId(authentication);
        return noStore(ticketService.getTicketByIdVisibleToUser(id, currentUserId));
    }

    // POST creates a new ticket resource.
    @PostMapping
    public ResponseEntity<TicketResponse> createTicket(
            // Authentication comes from the stateless JWT sent with this request.
            Authentication authentication,
            // @Valid triggers DTO validation before service logic runs.
            @Valid @RequestBody TicketRequest request) {
        Long currentUserId = authenticatedUserService.getCurrentUserId(authentication);
        TicketResponse created = ticketService.createTicket(currentUserId, request);
        // 201 Created: includes a Location header for the new ticket resource.
        return ResponseEntity.created(URI.create("/api/v1/tickets/" + created.getId()))
                // no-store: prevents private ticket data from being cached by browser/proxy.
                .cacheControl(CacheControl.noStore())
                .header(HttpHeaders.PRAGMA, "no-cache")
                .body(created);
    }

    // PUT replaces the editable fields of an existing ticket resource.
    @PutMapping("/{id}")
    public ResponseEntity<TicketResponse> updateTicket(
            @PathVariable Long id,
            // Authentication comes from the stateless JWT sent with this request.
            Authentication authentication,
            // @Valid triggers DTO validation before service logic runs.
            @Valid @RequestBody TicketRequest request) {
        Long currentUserId = authenticatedUserService.getCurrentUserId(authentication);
        return noStore(ticketService.updateTicket(id, request, currentUserId));
    }

    // PATCH partially updates ticket status instead of replacing the full ticket.
    @PatchMapping("/{id}")
    public ResponseEntity<TicketResponse> updateTicketStatus(
            @PathVariable Long id,
            // Authentication comes from the stateless JWT sent with this request.
            Authentication authentication,
            // @Valid triggers DTO validation before service logic runs.
            @Valid @RequestBody TicketStatusUpdateRequest request) {
        Long currentUserId = authenticatedUserService.getCurrentUserId(authentication);
        return noStore(ticketService.updateStatus(id, request, currentUserId));
    }

    // GET reads assignable technician lookup data for one ticket.
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
        return noStore(ticketService.assignTicket(id, currentUserId, request));
    }

    // PATCH partially updates ticket resolution notes.
    @PatchMapping("/{id}/resolution")
    public ResponseEntity<TicketResponse> updateTicketResolution(
            @PathVariable Long id,
            // Authentication comes from the stateless JWT sent with this request.
            Authentication authentication,
            // @Valid triggers DTO validation before service logic runs.
            @Valid @RequestBody TicketResolutionUpdateRequest request) {
        Long currentUserId = authenticatedUserService.getCurrentUserId(authentication);
        return noStore(ticketService.updateResolutionNotes(id, request, currentUserId));
    }

    // PATCH partially updates the ticket due date.
    @PatchMapping("/{id}/due-date")
    public ResponseEntity<TicketResponse> updateTicketDueDate(
            @PathVariable Long id,
            // Authentication comes from the stateless JWT sent with this request.
            Authentication authentication,
            // @Valid triggers DTO validation before service logic runs.
            @Valid @RequestBody TicketDueDateUpdateRequest request) {
        Long currentUserId = authenticatedUserService.getCurrentUserId(authentication);
        return noStore(ticketService.extendDueDate(id, request, currentUserId));
    }

    // DELETE removes one ticket resource.
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTicket(
            @PathVariable Long id,
            // Authentication comes from the stateless JWT sent with this request.
            Authentication authentication) {
        Long currentUserId = authenticatedUserService.getCurrentUserId(authentication);
        ticketService.deleteTicket(id, currentUserId);
        // 204 No Content: delete succeeded and there is no response body.
        return ResponseEntity.noContent()
                // no-store: prevents private ticket data from being cached by browser/proxy.
                .cacheControl(CacheControl.noStore())
                .header(HttpHeaders.PRAGMA, "no-cache")
                .build();
    }

    // GET reads comments nested under a ticket resource.
    @GetMapping("/{ticketId}/comments")
    public ResponseEntity<List<TicketCommentResponse>> getComments(
            @PathVariable Long ticketId,
            // Authentication comes from the stateless JWT sent with this request.
            Authentication authentication) {
        Long currentUserId = authenticatedUserService.getCurrentUserId(authentication);
        return noStore(commentService.getComments(ticketId, currentUserId));
    }

    // POST creates a new comment under a ticket resource.
    @PostMapping("/{ticketId}/comments")
    public ResponseEntity<TicketCommentResponse> addComment(
            @PathVariable Long ticketId,
            // Authentication comes from the stateless JWT sent with this request.
            Authentication authentication,
            // @Valid triggers DTO validation before service logic runs.
            @Valid @RequestBody TicketCommentRequest request) {
        Long userId = authenticatedUserService.getCurrentUserId(authentication);
        return ResponseEntity.status(HttpStatus.CREATED)
                // no-store: prevents private ticket comments from being cached.
                .cacheControl(CacheControl.noStore())
                .header(HttpHeaders.PRAGMA, "no-cache")
                .body(commentService.addComment(ticketId, userId, request));
    }

    // PUT replaces the editable fields of an existing ticket comment.
    @PutMapping("/{ticketId}/comments/{commentId}")
    public ResponseEntity<TicketCommentResponse> updateComment(
            @PathVariable Long ticketId,
            @PathVariable Long commentId,
            // Authentication comes from the stateless JWT sent with this request.
            Authentication authentication,
            // @Valid triggers DTO validation before service logic runs.
            @Valid @RequestBody TicketCommentRequest request) {
        Long userId = authenticatedUserService.getCurrentUserId(authentication);
        return noStore(commentService.updateComment(ticketId, commentId, userId, request));
    }

    // DELETE removes one comment from a ticket resource.
    @DeleteMapping("/{ticketId}/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long ticketId,
            @PathVariable Long commentId,
            // Authentication comes from the stateless JWT sent with this request.
            Authentication authentication) {
        Long userId = authenticatedUserService.getCurrentUserId(authentication);
        commentService.deleteComment(ticketId, commentId, userId);
        // 204 No Content: delete succeeded and there is no response body.
        return ResponseEntity.noContent()
                // no-store: prevents private ticket comments from being cached.
                .cacheControl(CacheControl.noStore())
                .header(HttpHeaders.PRAGMA, "no-cache")
                .build();
    }

    // GET reads attachment URLs nested under a ticket resource.
    @GetMapping("/{ticketId}/attachments")
    public ResponseEntity<List<String>> getAttachments(
            @PathVariable Long ticketId,
            // Authentication comes from the stateless JWT sent with this request.
            Authentication authentication) {
        Long currentUserId = authenticatedUserService.getCurrentUserId(authentication);
        return noStore(attachmentService.get(ticketId, currentUserId));
    }

    // POST uploads new attachments under a ticket resource.
    @PostMapping("/{ticketId}/attachments")
    public ResponseEntity<List<String>> uploadAttachments(
            @PathVariable Long ticketId,
            // Authentication comes from the stateless JWT sent with this request.
            Authentication authentication,
            @RequestParam("files") List<MultipartFile> files) {
        Long currentUserId = authenticatedUserService.getCurrentUserId(authentication);
        return ResponseEntity.status(HttpStatus.CREATED)
                // no-store: prevents private ticket attachments from being cached.
                .cacheControl(CacheControl.noStore())
                .header(HttpHeaders.PRAGMA, "no-cache")
                .body(attachmentService.upload(ticketId, currentUserId, files));
    }

    // DELETE removes one attachment from a ticket resource.
    @DeleteMapping("/{ticketId}/attachments")
    public ResponseEntity<Void> deleteAttachment(
            @PathVariable Long ticketId,
            // Authentication comes from the stateless JWT sent with this request.
            Authentication authentication,
            @RequestParam String url) {
        Long currentUserId = authenticatedUserService.getCurrentUserId(authentication);
        attachmentService.delete(ticketId, currentUserId, url);
        // 204 No Content: delete succeeded and there is no response body.
        return ResponseEntity.noContent()
                // no-store: prevents private ticket attachments from being cached.
                .cacheControl(CacheControl.noStore())
                .header(HttpHeaders.PRAGMA, "no-cache")
                .build();
    }

    private <T> ResponseEntity<T> noStore(T body) {
        // 200 OK: successful ticket response with a body.
        return ResponseEntity.ok()
                // no-store: prevents private ticket data from being cached by browser/proxy.
                .cacheControl(CacheControl.noStore())
                .header(HttpHeaders.PRAGMA, "no-cache")
                .body(body);
    }
}
