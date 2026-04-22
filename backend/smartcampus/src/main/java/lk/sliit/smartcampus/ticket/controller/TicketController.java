package lk.sliit.smartcampus.ticket.controller;

import jakarta.validation.Valid;
import lk.sliit.smartcampus.ticket.dto.TicketAttachmentResponse;
import lk.sliit.smartcampus.ticket.dto.TicketCommentRequest;
import lk.sliit.smartcampus.ticket.dto.TicketCommentResponse;
import lk.sliit.smartcampus.ticket.dto.TicketRequest;
import lk.sliit.smartcampus.ticket.dto.TicketResolutionUpdateRequest;
import lk.sliit.smartcampus.ticket.dto.TicketResponse;
import lk.sliit.smartcampus.ticket.dto.TicketStatusUpdateRequest;
import lk.sliit.smartcampus.ticket.entity.TicketPriority;
import lk.sliit.smartcampus.ticket.entity.TicketStatus;
import lk.sliit.smartcampus.ticket.service.TicketAttachmentService;
import lk.sliit.smartcampus.ticket.service.TicketCommentService;
import lk.sliit.smartcampus.ticket.service.TicketService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tickets")
public class TicketController {

    private final TicketService ticketService;
    private final TicketCommentService commentService;
    private final TicketAttachmentService attachmentService;

    public TicketController(TicketService ticketService,
                            TicketCommentService commentService,
                            TicketAttachmentService attachmentService) {
        this.ticketService = ticketService;
        this.commentService = commentService;
        this.attachmentService = attachmentService;
    }

    @GetMapping
public ResponseEntity<List<TicketResponse>> getAllTickets(
        @RequestHeader("X-User-Id") Long currentUserId,
        @RequestParam(required = false) TicketStatus status,
        @RequestParam(required = false) TicketPriority priority,
        @RequestParam(required = false) Long reportedBy,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
) {
    return ResponseEntity.ok(ticketService.getAllTickets(currentUserId, status, priority, reportedBy, page, size));
}

    @GetMapping("/my")
public ResponseEntity<List<TicketResponse>> getMyTickets(
        @RequestHeader("X-User-Id") Long currentUserId,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size) {
    return ResponseEntity.ok(ticketService.getMyVisibleTickets(currentUserId, page, size));
}

    @GetMapping("/{id}")
    public ResponseEntity<TicketResponse> getTicketById(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long currentUserId) {
        return ResponseEntity.ok(ticketService.getTicketByIdVisibleToUser(id, currentUserId));
    }

    @PostMapping
    public ResponseEntity<TicketResponse> createTicket(
            @RequestHeader("X-User-Id") Long currentUserId,
            @Valid @RequestBody TicketRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ticketService.createTicket(currentUserId, request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TicketResponse> updateTicket(@PathVariable Long id,
                                                       @Valid @RequestBody TicketRequest request) {
        return ResponseEntity.ok(ticketService.updateTicket(id, request));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<TicketResponse> updateTicketStatus(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long currentUserId,
            @Valid @RequestBody TicketStatusUpdateRequest request) {
        return ResponseEntity.ok(ticketService.updateStatus(id, request, currentUserId));
    }

    @PatchMapping("/{id}/resolution")
    public ResponseEntity<TicketResponse> updateResolution(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long currentUserId,
            @Valid @RequestBody TicketResolutionUpdateRequest request) {
        return ResponseEntity.ok(ticketService.updateResolution(id, currentUserId, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTicket(@PathVariable Long id) {
        ticketService.deleteTicket(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{ticketId}/comments")
    public ResponseEntity<List<TicketCommentResponse>> getComments(
            @PathVariable Long ticketId,
            @RequestHeader("X-User-Id") Long currentUserId) {
        return ResponseEntity.ok(commentService.getComments(ticketId, currentUserId));
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
        commentService.deleteComment(ticketId, commentId, userId);
        return ResponseEntity.noContent().build();
    }

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
}