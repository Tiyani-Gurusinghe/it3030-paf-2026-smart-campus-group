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

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TicketCommentService {

    private final TicketCommentRepository commentRepository;
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public TicketCommentService(
            TicketCommentRepository commentRepository,
            TicketRepository ticketRepository,
            UserRepository userRepository,
            NotificationService notificationService) {
        this.commentRepository = commentRepository;
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    public List<TicketCommentResponse> getComments(Long ticketId) {
        ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + ticketId));
        return commentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public TicketCommentResponse addComment(Long ticketId, Long authorId, TicketCommentRequest request) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + ticketId));
        User author = userRepository.findById(authorId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + authorId));

        TicketComment comment = new TicketComment();
        comment.setTicketId(ticketId);
        comment.setAuthorId(authorId);
        comment.setAuthorName(author.getFullName());
        comment.setContent(request.getContent());
        TicketComment saved = commentRepository.save(comment);

        // Notify ticket reporter if the commenter is different
        if (ticket.getReportedBy() != null && !ticket.getReportedBy().equals(authorId)) {
            notificationService.createNotification(
                    ticket.getReportedBy(),
                    NotificationType.NEW_COMMENT,
                    author.getFullName() + " commented on your ticket: \"" + ticket.getTitle() + "\"",
                    ticketId
            );
        }

        return toResponse(saved);
    }

    public TicketCommentResponse updateComment(Long ticketId, Long commentId, Long requesterId, TicketCommentRequest request) {
        TicketComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found: " + commentId));
        if (!comment.getTicketId().equals(ticketId)) {
            throw new ResourceNotFoundException("Comment does not belong to this ticket");
        }
        if (!comment.getAuthorId().equals(requesterId)) {
            throw new UnauthorizedException("You can only edit your own comments");
        }
        comment.setContent(request.getContent());
        return toResponse(commentRepository.save(comment));
    }

    public void deleteComment(Long ticketId, Long commentId, Long requesterId, boolean isAdmin) {
        TicketComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found: " + commentId));
        if (!comment.getTicketId().equals(ticketId)) {
            throw new ResourceNotFoundException("Comment does not belong to this ticket");
        }
        if (!isAdmin && !comment.getAuthorId().equals(requesterId)) {
            throw new UnauthorizedException("You can only delete your own comments");
        }
        commentRepository.delete(comment);
    }

    private TicketCommentResponse toResponse(TicketComment c) {
        TicketCommentResponse r = new TicketCommentResponse();
        r.setId(c.getId());
        r.setTicketId(c.getTicketId());
        r.setAuthorId(c.getAuthorId());
        r.setAuthorName(c.getAuthorName());
        r.setContent(c.getContent());
        r.setCreatedAt(c.getCreatedAt());
        r.setUpdatedAt(c.getUpdatedAt());
        return r;
    }
}
