package lk.sliit.smartcampus.ticket.service;

import lk.sliit.smartcampus.exception.ResourceNotFoundException;
import lk.sliit.smartcampus.exception.UnauthorizedException;
import lk.sliit.smartcampus.notification.entity.NotificationType;
import lk.sliit.smartcampus.notification.service.NotificationService;
import lk.sliit.smartcampus.ticket.dto.TicketCommentRequest;
import lk.sliit.smartcampus.ticket.dto.TicketCommentResponse;
import lk.sliit.smartcampus.ticket.entity.Ticket;
import lk.sliit.smartcampus.ticket.entity.TicketComment;
import lk.sliit.smartcampus.ticket.repository.TicketCommentRepository;
import lk.sliit.smartcampus.ticket.repository.TicketRepository;
import lk.sliit.smartcampus.user.entity.User;
import lk.sliit.smartcampus.user.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TicketCommentService {

    private final TicketCommentRepository commentRepository;
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final TicketService ticketService;

    public TicketCommentService(TicketCommentRepository commentRepository,
                                TicketRepository ticketRepository,
                                UserRepository userRepository,
                                NotificationService notificationService,
                                TicketService ticketService) {
        this.commentRepository = commentRepository;
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.ticketService = ticketService;
    }

    public List<TicketCommentResponse> getComments(Long ticketId, Long currentUserId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + ticketId));

        ticketService.validateTicketVisibility(ticket, currentUserId);

        return commentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId)
                .stream()
                .filter(c -> c.getDeletedAt() == null)
                .map(c -> toResponse(c, resolveUserName(c.getUserId())))
                .collect(Collectors.toList());
    }

    public TicketCommentResponse addComment(Long ticketId, Long userId, TicketCommentRequest request) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + ticketId));

        ticketService.validateTicketVisibility(ticket, userId);

        User author = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        TicketComment comment = new TicketComment();
        comment.setTicketId(ticketId);
        comment.setUserId(userId);
        comment.setContent(request.getContent());

        TicketComment saved = commentRepository.save(comment);

        if (ticket.getReportedBy() != null && !ticket.getReportedBy().equals(userId)) {
            notificationService.createNotification(
                    ticket.getReportedBy(),
                    NotificationType.NEW_COMMENT,
                    "New Comment",
                    author.getFullName() + " commented on your ticket: \"" + ticket.getTitle() + "\"",
                    ticketId
            );
        }

        return toResponse(saved, author.getFullName());
    }

    public TicketCommentResponse updateComment(Long ticketId, Long commentId, Long requesterId, TicketCommentRequest request) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + ticketId));

        ticketService.validateTicketVisibility(ticket, requesterId);

        TicketComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found: " + commentId));

        if (!comment.getTicketId().equals(ticketId) || comment.getDeletedAt() != null) {
            throw new ResourceNotFoundException("Comment does not belong to this ticket");
        }

        boolean isAdmin = ticketService.isAdmin(requesterId);

        if (!isAdmin && !comment.getUserId().equals(requesterId)) {
            throw new UnauthorizedException("You can only edit your own comments");
        }

        comment.setContent(request.getContent());
        return toResponse(commentRepository.save(comment), resolveUserName(comment.getUserId()));
    }

    public void deleteComment(Long ticketId, Long commentId, Long requesterId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + ticketId));

        ticketService.validateTicketVisibility(ticket, requesterId);

        TicketComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found: " + commentId));

        if (!comment.getTicketId().equals(ticketId) || comment.getDeletedAt() != null) {
            throw new ResourceNotFoundException("Comment does not belong to this ticket");
        }

        boolean isAdmin = ticketService.isAdmin(requesterId);

        if (!isAdmin && !comment.getUserId().equals(requesterId)) {
            throw new UnauthorizedException("You can only delete your own comments");
        }

        comment.setDeletedAt(LocalDateTime.now());
        commentRepository.save(comment);
    }

    private TicketCommentResponse toResponse(TicketComment c, String authorName) {
        TicketCommentResponse r = new TicketCommentResponse();
        r.setId(c.getId());
        r.setTicketId(c.getTicketId());
        r.setUserId(c.getUserId());
        r.setAuthorName(authorName);
        r.setContent(c.getContent());
        r.setCreatedAt(c.getCreatedAt());
        r.setUpdatedAt(c.getUpdatedAt());
        return r;
    }

    private String resolveUserName(Long userId) {
        return userRepository.findById(userId)
                .map(User::getFullName)
                .orElse("Unknown User");
    }
}