package lk.sliit.smartcampus.ticket.service;

import lk.sliit.smartcampus.common.enums.RoleType;
import lk.sliit.smartcampus.exception.UnauthorizedException;
import lk.sliit.smartcampus.notification.service.NotificationService;
import lk.sliit.smartcampus.resource.repository.ResourceRepository;
import lk.sliit.smartcampus.ticket.dto.TicketRequest;
import lk.sliit.smartcampus.ticket.dto.TicketStatusUpdateRequest;
import lk.sliit.smartcampus.ticket.repository.ResourceTypeSkillRepository;
import lk.sliit.smartcampus.ticket.entity.Ticket;
import lk.sliit.smartcampus.ticket.entity.TicketPriority;
import lk.sliit.smartcampus.ticket.entity.TicketStatus;
import lk.sliit.smartcampus.ticket.repository.TechnicianSkillRepository;
import lk.sliit.smartcampus.ticket.repository.TicketRepository;
import lk.sliit.smartcampus.user.entity.User;
import lk.sliit.smartcampus.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class TicketServiceTest {

    private TicketRepository ticketRepository;
    private TechnicianSkillRepository technicianSkillRepository;
    private ResourceTypeSkillRepository resourceTypeSkillRepository;
    private ResourceRepository resourceRepository;
    private UserRepository userRepository;
    private NotificationService notificationService;
    private TicketValidationService validationService;
    private TicketService service;

    @BeforeEach
    void setUp() {
        ticketRepository = mock(TicketRepository.class);
        technicianSkillRepository = mock(TechnicianSkillRepository.class);
        resourceTypeSkillRepository = mock(ResourceTypeSkillRepository.class);
        resourceRepository = mock(ResourceRepository.class);
        userRepository = mock(UserRepository.class);
        notificationService = mock(NotificationService.class);
        validationService = mock(TicketValidationService.class);

        service = new TicketService(
                ticketRepository,
                technicianSkillRepository,
                resourceTypeSkillRepository,
                resourceRepository,
                userRepository,
                notificationService,
                validationService
        );
    }

    @Test
    // Test proof: auto assignment chooses the technician with the lowest active load.
    void autoAssignmentChoosesLeastBusyTechnician() {
        User reporter = new User();
        reporter.setId(1L);

        when(userRepository.findById(1L)).thenReturn(Optional.of(reporter));
        when(technicianSkillRepository.findTechnicianIdsBySkillId(2L)).thenReturn(List.of(3L, 4L));
        when(ticketRepository.countByAssignedToAndStatusIn(eq(3L), anyList())).thenReturn(5L);
        when(ticketRepository.countByAssignedToAndStatusIn(eq(4L), anyList())).thenReturn(1L);
        when(ticketRepository.save(any(Ticket.class))).thenAnswer(invocation -> {
            Ticket t = invocation.getArgument(0);
            t.setId(10L);
            return t;
        });

        TicketRequest request = new TicketRequest();
        request.setTitle("AC issue");
        request.setLocation("Main Building");
        request.setCategory("FACILITY");
        request.setDescription("Broken");
        request.setResourceId(1L);
        request.setRequiredSkillId(2L);
        request.setPriority(TicketPriority.HIGH);
        request.setPreferredContact("user@test.com");

        var response = service.createTicket(1L, request);

        assertEquals(4L, response.getAssignedTo());
        assertEquals(1L, response.getReportedBy());
        assertEquals("Main Building", response.getLocation());
        assertEquals("FACILITY", response.getCategory());
        assertEquals("user@test.com", response.getPreferredContact());
    }

    @Test
    // Test proof: invalid role/action returns 403-style UnauthorizedException.
    void unauthorizedUserCannotUpdateStatus() {
        Ticket ticket = new Ticket();
        ticket.setId(1L);
        ticket.setStatus(TicketStatus.OPEN);
        ticket.setReportedBy(2L);

        User normalUser = mock(User.class);
        when(normalUser.getId()).thenReturn(5L);
        when(normalUser.hasRole(RoleType.ADMIN)).thenReturn(false);
        when(normalUser.hasRole(RoleType.TECHNICIAN)).thenReturn(false);

        when(ticketRepository.findById(1L)).thenReturn(Optional.of(ticket));
        when(userRepository.findById(5L)).thenReturn(Optional.of(normalUser));

        TicketStatusUpdateRequest request = new TicketStatusUpdateRequest();
        request.setStatus(TicketStatus.IN_PROGRESS);

        assertThrows(UnauthorizedException.class,
                () -> service.updateStatus(1L, request, 5L));
    }

    @Test
    // Test proof: reporter can resolve and close their own ticket through allowed transitions.
    void reporterCanResolveAndCloseOwnTicket() {
        Ticket ticket = new Ticket();
        ticket.setId(1L);
        ticket.setStatus(TicketStatus.IN_PROGRESS);
        ticket.setReportedBy(2L);
        ticket.setTitle("Projector issue");

        User reporter = mock(User.class);
        when(reporter.getId()).thenReturn(2L);
        when(reporter.hasRole(RoleType.ADMIN)).thenReturn(false);
        when(reporter.hasRole(RoleType.TECHNICIAN)).thenReturn(false);

        when(ticketRepository.findById(1L)).thenReturn(Optional.of(ticket));
        when(userRepository.findById(2L)).thenReturn(Optional.of(reporter));
        when(ticketRepository.save(any(Ticket.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TicketStatusUpdateRequest resolveRequest = new TicketStatusUpdateRequest();
        resolveRequest.setStatus(TicketStatus.RESOLVED);
        resolveRequest.setResolutionNotes("Issue no longer occurs.");

        var resolved = service.updateStatus(1L, resolveRequest, 2L);

        assertEquals(TicketStatus.RESOLVED, resolved.getStatus());
        assertEquals("Issue no longer occurs.", resolved.getResolutionNotes());

        TicketStatusUpdateRequest closeRequest = new TicketStatusUpdateRequest();
        closeRequest.setStatus(TicketStatus.CLOSED);

        var closed = service.updateStatus(1L, closeRequest, 2L);

        assertEquals(TicketStatus.CLOSED, closed.getStatus());
        verify(ticketRepository, org.mockito.Mockito.atLeastOnce()).save(ticket);
    }
}
