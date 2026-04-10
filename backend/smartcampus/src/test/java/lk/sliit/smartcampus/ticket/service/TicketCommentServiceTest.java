package lk.sliit.smartcampus.ticket.service;

import lk.sliit.smartcampus.exception.ResourceNotFoundException;
import lk.sliit.smartcampus.exception.UnauthorizedException;
import lk.sliit.smartcampus.ticket.dto.TicketCommentRequest;
import lk.sliit.smartcampus.ticket.entity.Ticket;
import lk.sliit.smartcampus.ticket.entity.TicketComment;
import lk.sliit.smartcampus.ticket.repository.TicketCommentRepository;
import lk.sliit.smartcampus.ticket.repository.TicketRepository;
import lk.sliit.smartcampus.user.entity.User;
import lk.sliit.smartcampus.user.repository.UserRepository;
import lk.sliit.smartcampus.notification.service.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class TicketCommentServiceTest {

    private TicketCommentRepository commentRepository;
    private TicketRepository ticketRepository;
    private UserRepository userRepository;
    private NotificationService notificationService;
    private TicketService ticketService;
    private TicketCommentService service;

    @BeforeEach
    void setUp() {
        commentRepository = mock(TicketCommentRepository.class);
        ticketRepository = mock(TicketRepository.class);
        userRepository = mock(UserRepository.class);
        notificationService = mock(NotificationService.class);
        ticketService = mock(TicketService.class);

        service = new TicketCommentService(
                commentRepository,
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

        TicketComment comment = new TicketComment();
        comment.setId(100L);
        comment.setTicketId(1L);
        comment.setUserId(3L);
        comment.setCreatedAt(LocalDateTime.now());
        comment.setUpdatedAt(LocalDateTime.now());

        TicketCommentRequest request = new TicketCommentRequest();
        request.setContent("Updated");

        when(ticketRepository.findById(1L)).thenReturn(Optional.of(ticket));
        when(commentRepository.findById(100L)).thenReturn(Optional.of(comment));
        when(ticketService.isAdmin(3L)).thenReturn(false);
        when(commentRepository.save(any(TicketComment.class))).thenAnswer(i -> i.getArgument(0));
        when(userRepository.findById(3L)).thenReturn(Optional.of(mock(User.class)));

        assertDoesNotThrow(() -> service.updateComment(1L, 100L, 3L, request));
    }

    @Test
    void nonOwnerCannotEditComment() {
        Ticket ticket = new Ticket();
        ticket.setId(1L);

        TicketComment comment = new TicketComment();
        comment.setId(100L);
        comment.setTicketId(1L);
        comment.setUserId(3L);

        TicketCommentRequest request = new TicketCommentRequest();
        request.setContent("Updated");

        when(ticketRepository.findById(1L)).thenReturn(Optional.of(ticket));
        when(commentRepository.findById(100L)).thenReturn(Optional.of(comment));
        when(ticketService.isAdmin(4L)).thenReturn(false);

        assertThrows(UnauthorizedException.class,
                () -> service.updateComment(1L, 100L, 4L, request));
    }

    @Test
    void nonOwnerCannotDeleteComment() {
        Ticket ticket = new Ticket();
        ticket.setId(1L);

        TicketComment comment = new TicketComment();
        comment.setId(100L);
        comment.setTicketId(1L);
        comment.setUserId(3L);

        when(ticketRepository.findById(1L)).thenReturn(Optional.of(ticket));
        when(commentRepository.findById(100L)).thenReturn(Optional.of(comment));
        when(ticketService.isAdmin(4L)).thenReturn(false);

        assertThrows(UnauthorizedException.class,
                () -> service.deleteComment(1L, 100L, 4L));
    }
}