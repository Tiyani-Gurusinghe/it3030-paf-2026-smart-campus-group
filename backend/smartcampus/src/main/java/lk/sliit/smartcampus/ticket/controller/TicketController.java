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

    @GetMapping
    public ResponseEntity<PageResponse<TicketResponse>> getAllTickets(
            Authentication authentication,
            @RequestParam(required = false) TicketStatus status,
            @RequestParam(required = false) TicketPriority priority,
            @RequestParam(required = false) Long reportedBy,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Long currentUserId = authenticatedUserService.getCurrentUserId(authentication);
        return noStore(PageResponse.from(
                ticketService.getAllTickets(currentUserId, status, priority, reportedBy, page, size)
        ));
    }

    @GetMapping("/my")
    public ResponseEntity<PageResponse<TicketResponse>> getMyTickets(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Long currentUserId = authenticatedUserService.getCurrentUserId(authentication);
        return noStore(PageResponse.from(ticketService.getMyVisibleTickets(currentUserId, page, size)));
    }

    @GetMapping("/skills")
    public ResponseEntity<List<SkillOptionResponse>> getSkillsForResource(
            @RequestParam Long resourceId) {
        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(Duration.ofMinutes(5)).cachePublic())
                .body(ticketService.getSkillsForResource(resourceId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TicketResponse> getTicketById(
            @PathVariable Long id,
            Authentication authentication) {
        Long currentUserId = authenticatedUserService.getCurrentUserId(authentication);
        return noStore(ticketService.getTicketByIdVisibleToUser(id, currentUserId));
    }

    @PostMapping
    public ResponseEntity<TicketResponse> createTicket(
            Authentication authentication,
            @Valid @RequestBody TicketRequest request) {
        Long currentUserId = authenticatedUserService.getCurrentUserId(authentication);
        TicketResponse created = ticketService.createTicket(currentUserId, request);
        return ResponseEntity.created(URI.create("/api/v1/tickets/" + created.getId()))
                .cacheControl(CacheControl.noStore())
                .header(HttpHeaders.PRAGMA, "no-cache")
                .body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TicketResponse> updateTicket(
            @PathVariable Long id,
            Authentication authentication,
            @Valid @RequestBody TicketRequest request) {
        Long currentUserId = authenticatedUserService.getCurrentUserId(authentication);
        return noStore(ticketService.updateTicket(id, request, currentUserId));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<TicketResponse> updateTicketStatus(
            @PathVariable Long id,
            Authentication authentication,
            @Valid @RequestBody TicketStatusUpdateRequest request) {
        Long currentUserId = authenticatedUserService.getCurrentUserId(authentication);
        return noStore(ticketService.updateStatus(id, request, currentUserId));
    }

    @PatchMapping("/{id}/resolution")
    public ResponseEntity<TicketResponse> updateTicketResolution(
            @PathVariable Long id,
            Authentication authentication,
            @Valid @RequestBody TicketResolutionUpdateRequest request) {
        Long currentUserId = authenticatedUserService.getCurrentUserId(authentication);
        return noStore(ticketService.updateResolutionNotes(id, request, currentUserId));
    }

    @PatchMapping("/{id}/due-date")
    public ResponseEntity<TicketResponse> updateTicketDueDate(
            @PathVariable Long id,
            Authentication authentication,
            @Valid @RequestBody TicketDueDateUpdateRequest request) {
        Long currentUserId = authenticatedUserService.getCurrentUserId(authentication);
        return noStore(ticketService.extendDueDate(id, request, currentUserId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTicket(
            @PathVariable Long id,
            Authentication authentication) {
        Long currentUserId = authenticatedUserService.getCurrentUserId(authentication);
        ticketService.deleteTicket(id, currentUserId);
        return ResponseEntity.noContent()
                .cacheControl(CacheControl.noStore())
                .header(HttpHeaders.PRAGMA, "no-cache")
                .build();
    }

    @GetMapping("/{ticketId}/comments")
    public ResponseEntity<List<TicketCommentResponse>> getComments(
            @PathVariable Long ticketId,
            Authentication authentication) {
        Long currentUserId = authenticatedUserService.getCurrentUserId(authentication);
        return noStore(commentService.getComments(ticketId, currentUserId));
    }

    @PostMapping("/{ticketId}/comments")
    public ResponseEntity<TicketCommentResponse> addComment(
            @PathVariable Long ticketId,
            Authentication authentication,
            @Valid @RequestBody TicketCommentRequest request) {
        Long userId = authenticatedUserService.getCurrentUserId(authentication);
        return ResponseEntity.status(HttpStatus.CREATED)
                .cacheControl(CacheControl.noStore())
                .header(HttpHeaders.PRAGMA, "no-cache")
                .body(commentService.addComment(ticketId, userId, request));
    }

    @PutMapping("/{ticketId}/comments/{commentId}")
    public ResponseEntity<TicketCommentResponse> updateComment(
            @PathVariable Long ticketId,
            @PathVariable Long commentId,
            Authentication authentication,
            @Valid @RequestBody TicketCommentRequest request) {
        Long userId = authenticatedUserService.getCurrentUserId(authentication);
        return noStore(commentService.updateComment(ticketId, commentId, userId, request));
    }

    @DeleteMapping("/{ticketId}/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long ticketId,
            @PathVariable Long commentId,
            Authentication authentication) {
        Long userId = authenticatedUserService.getCurrentUserId(authentication);
        commentService.deleteComment(ticketId, commentId, userId);
        return ResponseEntity.noContent()
                .cacheControl(CacheControl.noStore())
                .header(HttpHeaders.PRAGMA, "no-cache")
                .build();
    }

    @GetMapping("/{ticketId}/attachments")
    public ResponseEntity<List<String>> getAttachments(
            @PathVariable Long ticketId,
            Authentication authentication) {
        Long currentUserId = authenticatedUserService.getCurrentUserId(authentication);
        return noStore(attachmentService.get(ticketId, currentUserId));
    }

    @PostMapping("/{ticketId}/attachments")
    public ResponseEntity<List<String>> uploadAttachments(
            @PathVariable Long ticketId,
            Authentication authentication,
            @RequestParam("files") List<MultipartFile> files) {
        Long currentUserId = authenticatedUserService.getCurrentUserId(authentication);
        return ResponseEntity.status(HttpStatus.CREATED)
                .cacheControl(CacheControl.noStore())
                .header(HttpHeaders.PRAGMA, "no-cache")
                .body(attachmentService.upload(ticketId, currentUserId, files));
    }

    @DeleteMapping("/{ticketId}/attachments")
    public ResponseEntity<Void> deleteAttachment(
            @PathVariable Long ticketId,
            Authentication authentication,
            @RequestParam String url) {
        Long currentUserId = authenticatedUserService.getCurrentUserId(authentication);
        attachmentService.delete(ticketId, currentUserId, url);
        return ResponseEntity.noContent()
                .cacheControl(CacheControl.noStore())
                .header(HttpHeaders.PRAGMA, "no-cache")
                .build();
    }

    private <T> ResponseEntity<T> noStore(T body) {
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .header(HttpHeaders.PRAGMA, "no-cache")
                .body(body);
    }
}
