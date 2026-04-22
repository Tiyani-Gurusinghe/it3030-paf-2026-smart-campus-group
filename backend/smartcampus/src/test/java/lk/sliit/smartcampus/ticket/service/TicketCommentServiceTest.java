package lk.sliit.smartcampus.ticket.service;

import lk.sliit.smartcampus.exception.UnauthorizedException;
import lk.sliit.smartcampus.ticket.dto.TicketCommentRequest;
import lk.sliit.smartcampus.ticket.entity.Ticket;
import lk.sliit.smartcampus.ticket.entity.TicketHistory;
import lk.sliit.smartcampus.ticket.repository.TicketHistoryRepository;
import lk.sliit.smartcampus.ticket.repository.TicketRepository;
import lk.sliit.smartcampus.user.entity.User;
import lk.sliit.smartcampus.user.repository.UserRepository;
import lk.sliit.smartcampus.notification.service.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

class TicketCommentServiceTest {

    private TicketHistoryRepository historyRepository;
    private TicketRepository ticketRepository;
    private UserRepository userRepository;
    private NotificationService notificationService;
    private TicketService ticketService;
    private TicketCommentService service;

    @BeforeEach
    void setUp() {
        historyRepository = mock(TicketHistoryRepository.class);
        ticketRepository = mock(TicketRepository.class);
        userRepository = mock(UserRepository.class);
        notificationService = mock(NotificationService.class);
        ticketService = mock(TicketService.class);

        service = new TicketCommentService(
                historyRepository,
                ticketRepository,
                userRepository,
                notificationService,
                ticketService
        );
    }

    @Test
    void commentOwnerCanEditOwnComment() {
        Ticket ticket = new Ticket();
        ticket.setId(1L);
        ticket.setReportedBy(2L);

        TicketHistory comment = new TicketHistory();
        comment.setId(100L);
        comment.setTicketId(1L);
        comment.setActorUserId(3L);
        comment.setActionType("COMMENT");
        comment.setCreatedAt(LocalDateTime.now());

        TicketCommentRequest request = new TicketCommentRequest();
        request.setContent("Updated");

        when(ticketRepository.findById(1L)).thenReturn(Optional.of(ticket));
        when(historyRepository.findById(100L)).thenReturn(Optional.of(comment));
        when(ticketService.isAdmin(3L)).thenReturn(false);
        when(historyRepository.save(any(TicketHistory.class))).thenAnswer(i -> i.getArgument(0));

        User user = new User();
        user.setId(3L);
        user.setFullName("Comment Owner");
        when(userRepository.findById(3L)).thenReturn(Optional.of(user));

        assertDoesNotThrow(() -> service.updateComment(1L, 100L, 3L, request));
    }

    @Test
    void nonOwnerCannotEditComment() {
        Ticket ticket = new Ticket();
        ticket.setId(1L);

        TicketHistory comment = new TicketHistory();
        comment.setId(100L);
        comment.setTicketId(1L);
        comment.setActorUserId(3L);
        comment.setActionType("COMMENT");

        TicketCommentRequest request = new TicketCommentRequest();
        request.setContent("Updated");

        when(ticketRepository.findById(1L)).thenReturn(Optional.of(ticket));
        when(historyRepository.findById(100L)).thenReturn(Optional.of(comment));
        when(ticketService.isAdmin(4L)).thenReturn(false);

        assertThrows(UnauthorizedException.class,
                () -> service.updateComment(1L, 100L, 4L, request));
    }

    @Test
    void nonOwnerCannotDeleteComment() {
        Ticket ticket = new Ticket();
        ticket.setId(1L);

        TicketHistory comment = new TicketHistory();
        comment.setId(100L);
        comment.setTicketId(1L);
        comment.setActorUserId(3L);
        comment.setActionType("COMMENT");

        when(ticketRepository.findById(1L)).thenReturn(Optional.of(ticket));
        when(historyRepository.findById(100L)).thenReturn(Optional.of(comment));
        when(ticketService.isAdmin(4L)).thenReturn(false);

        assertThrows(UnauthorizedException.class,
                () -> service.deleteComment(1L, 100L, 4L));
    }
}