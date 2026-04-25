package lk.sliit.smartcampus.ticket.service;

import lk.sliit.smartcampus.exception.ResourceNotFoundException;
import lk.sliit.smartcampus.exception.UnauthorizedException;
import lk.sliit.smartcampus.notification.entity.NotificationType;
import lk.sliit.smartcampus.notification.service.NotificationService;
import lk.sliit.smartcampus.ticket.dto.TicketCommentRequest;
import lk.sliit.smartcampus.ticket.dto.TicketCommentResponse;
import lk.sliit.smartcampus.ticket.entity.Ticket;
import lk.sliit.smartcampus.ticket.entity.TicketHistory;
import lk.sliit.smartcampus.ticket.repository.TicketHistoryRepository;
import lk.sliit.smartcampus.ticket.repository.TicketRepository;
import lk.sliit.smartcampus.user.entity.User;
import lk.sliit.smartcampus.user.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TicketCommentService {

    private final TicketHistoryRepository historyRepository;
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final TicketService ticketService;

    public TicketCommentService(TicketHistoryRepository historyRepository,
                                TicketRepository ticketRepository,
                                UserRepository userRepository,
                                NotificationService notificationService,
                                TicketService ticketService) {
        this.historyRepository = historyRepository;
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.ticketService = ticketService;
    }

    public List<TicketCommentResponse> getComments(Long ticketId, Long currentUserId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + ticketId));

        ticketService.validateTicketVisibility(ticket, currentUserId);

        return historyRepository.findByTicketIdOrderByCreatedAtAsc(ticketId)
                .stream()
                .filter(h -> "NOTE".equals(h.getActionType()))
                .map(h -> toResponse(h, resolveUserName(h.getActorUserId())))
                .collect(Collectors.toList());
    }

    public TicketCommentResponse addComment(Long ticketId, Long userId, TicketCommentRequest request) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + ticketId));

        ticketService.validateTicketVisibility(ticket, userId);

        User author = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        TicketHistory history = new TicketHistory();
        history.setTicketId(ticketId);
        history.setActorUserId(userId);
        history.setActionType("NOTE");
        history.setNote(request.getContent());

        TicketHistory saved = historyRepository.save(history);
        ticketService.markFirstResponseIfApplicable(ticket, userId);

        if (ticket.getReportedBy() != null && !ticket.getReportedBy().equals(userId)) {
            notificationService.createNotification(
                    ticket.getReportedBy(),
                    NotificationType.NEW_COMMENT,
                    "New comment on your ticket",
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

        TicketHistory history = historyRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found: " + commentId));

        if (!history.getTicketId().equals(ticketId) || !"NOTE".equals(history.getActionType())) {
            throw new ResourceNotFoundException("Comment does not belong to this ticket");
        }

        boolean isAdmin = ticketService.isAdmin(requesterId);

        if (!isAdmin && !history.getActorUserId().equals(requesterId)) {
            throw new UnauthorizedException("You can only edit your own comments");
        }

        history.setNote(request.getContent());
        TicketHistory saved = historyRepository.save(history);

        return toResponse(saved, resolveUserName(saved.getActorUserId()));
    }

    public void deleteComment(Long ticketId, Long commentId, Long requesterId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + ticketId));

        ticketService.validateTicketVisibility(ticket, requesterId);

        TicketHistory history = historyRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found: " + commentId));

        if (!history.getTicketId().equals(ticketId) || !"NOTE".equals(history.getActionType())) {
            throw new ResourceNotFoundException("Comment does not belong to this ticket");
        }

        boolean isAdmin = ticketService.isAdmin(requesterId);

        if (!isAdmin && !history.getActorUserId().equals(requesterId)) {
            throw new UnauthorizedException("You can only delete your own comments");
        }

        historyRepository.delete(history);
    }

    private TicketCommentResponse toResponse(TicketHistory history, String authorName) {
        TicketCommentResponse response = new TicketCommentResponse();
        response.setId(history.getId());
        response.setTicketId(history.getTicketId());
        response.setUserId(history.getActorUserId());
        response.setAuthorName(authorName);
        response.setContent(history.getNote());
        response.setCreatedAt(history.getCreatedAt());
        response.setUpdatedAt(history.getCreatedAt());
        return response;
    }

    private String resolveUserName(Long userId) {
        return userRepository.findById(userId)
                .map(User::getFullName)
                .orElse("Unknown User");
    }
}
