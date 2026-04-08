package lk.sliit.smartcampus.ticket.controller;

import jakarta.validation.Valid;
import lk.sliit.smartcampus.common.enums.RoleType;
import lk.sliit.smartcampus.ticket.dto.TicketAttachmentResponse;
import lk.sliit.smartcampus.ticket.dto.TicketCommentRequest;
import lk.sliit.smartcampus.ticket.dto.TicketCommentResponse;
import lk.sliit.smartcampus.ticket.dto.TicketRequest;
import lk.sliit.smartcampus.ticket.dto.TicketResponse;
import lk.sliit.smartcampus.ticket.dto.TicketStatusUpdateRequest;
import lk.sliit.smartcampus.ticket.entity.TicketPriority;
import lk.sliit.smartcampus.ticket.entity.TicketStatus;
import lk.sliit.smartcampus.ticket.service.TicketAttachmentService;
import lk.sliit.smartcampus.ticket.service.TicketCommentService;
import lk.sliit.smartcampus.ticket.service.TicketService;
import lk.sliit.smartcampus.user.entity.User;
import lk.sliit.smartcampus.user.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/tickets")
public class TicketController {

    private final TicketService ticketService;
    private final TicketCommentService commentService;
    private final TicketAttachmentService attachmentService;
    private final UserRepository userRepository;

    public TicketController(TicketService ticketService,
                            TicketCommentService commentService,
                            TicketAttachmentService attachmentService,
                            UserRepository userRepository) {
        this.ticketService = ticketService;
        this.commentService = commentService;
        this.attachmentService = attachmentService;
        this.userRepository = userRepository;
    }

    // ---------------- Tickets ----------------

    @GetMapping
    public ResponseEntity<List<TicketResponse>> getAllTickets(
            @RequestParam(required = false) TicketStatus status,
            @RequestParam(required = false) TicketPriority priority,
            @RequestParam(required = false) Long reportedBy
    ) {
        return ResponseEntity.ok(ticketService.getAllTickets(status, priority, reportedBy));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TicketResponse> getTicketById(@PathVariable Long id) {
        return ResponseEntity.ok(ticketService.getTicketById(id));
    }

    @PostMapping
    public ResponseEntity<TicketResponse> createTicket(@Valid @RequestBody TicketRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ticketService.createTicket(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TicketResponse> updateTicket(@PathVariable Long id,
                                                       @Valid @RequestBody TicketRequest request) {
        return ResponseEntity.ok(ticketService.updateTicket(id, request));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<TicketResponse> updateTicketStatus(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long performedBy,
            @Valid @RequestBody TicketStatusUpdateRequest request) {
        return ResponseEntity.ok(ticketService.updateTicketStatus(id, performedBy, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTicket(@PathVariable Long id) {
        ticketService.deleteTicket(id);
        return ResponseEntity.noContent().build();
    }

    // ---------------- Comments ----------------

    @GetMapping("/{ticketId}/comments")
    public ResponseEntity<List<TicketCommentResponse>> getComments(@PathVariable Long ticketId) {
        return ResponseEntity.ok(commentService.getComments(ticketId));
    }

    @PostMapping("/{ticketId}/comments")
    public ResponseEntity<TicketCommentResponse> addComment(
            @PathVariable Long ticketId,
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody TicketCommentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(commentService.addComment(ticketId, userId, request));
    }

    @PutMapping("/{ticketId}/comments/{commentId}")
    public ResponseEntity<TicketCommentResponse> updateComment(
            @PathVariable Long ticketId,
            @PathVariable Long commentId,
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody TicketCommentRequest request) {
        return ResponseEntity.ok(commentService.updateComment(ticketId, commentId, userId, request));
    }

    @DeleteMapping("/{ticketId}/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long ticketId,
            @PathVariable Long commentId,
            @RequestHeader("X-User-Id") Long userId) {
        boolean isAdmin = isAdminUser(userId);
        commentService.deleteComment(ticketId, commentId, userId, isAdmin);
        return ResponseEntity.noContent().build();
    }

    // ---------------- Attachments ----------------

    @GetMapping("/{ticketId}/attachments")
    public ResponseEntity<List<TicketAttachmentResponse>> getAttachments(@PathVariable Long ticketId) {
        return ResponseEntity.ok(attachmentService.getAttachments(ticketId));
    }

    @PostMapping("/{ticketId}/attachments")
    public ResponseEntity<List<TicketAttachmentResponse>> uploadAttachments(
            @PathVariable Long ticketId,
            @RequestHeader("X-User-Id") Long uploadedBy,
            @RequestParam("files") List<MultipartFile> files) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(attachmentService.uploadAttachments(ticketId, uploadedBy, files));
    }

    @DeleteMapping("/{ticketId}/attachments/{attachmentId}")
    public ResponseEntity<Void> deleteAttachment(
            @PathVariable Long ticketId,
            @PathVariable Long attachmentId) {
        attachmentService.deleteAttachment(ticketId, attachmentId);
        return ResponseEntity.noContent().build();
    }

    // ---------------- Helper ----------------

    private boolean isAdminUser(Long userId) {
    Optional<User> user = userRepository.findById(userId);
    return user.map(u -> u.hasRole(RoleType.ADMIN)).orElse(false);
}
}