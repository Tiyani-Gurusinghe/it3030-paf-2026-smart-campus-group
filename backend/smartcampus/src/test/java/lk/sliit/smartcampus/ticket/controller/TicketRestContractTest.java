package lk.sliit.smartcampus.ticket.controller;

import lk.sliit.smartcampus.auth.service.AuthenticatedUserService;
import lk.sliit.smartcampus.ticket.dto.*;
import lk.sliit.smartcampus.ticket.entity.TicketPriority;
import lk.sliit.smartcampus.ticket.entity.TicketStatus;
import lk.sliit.smartcampus.ticket.service.TicketAttachmentService;
import lk.sliit.smartcampus.ticket.service.TicketCommentService;
import lk.sliit.smartcampus.ticket.service.TicketService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.core.Authentication;
import org.springframework.web.multipart.MultipartFile;

import java.net.URI;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class TicketRestContractTest {

    private TicketService ticketService;
    private TicketCommentService commentService;
    private TicketAttachmentService attachmentService;
    private AuthenticatedUserService authenticatedUserService;
    private Authentication authentication;
    private TicketController ticketController;
    private AdminTicketController adminController;
    private TechnicianTicketController technicianController;

    @BeforeEach
    void setUp() {
        ticketService = mock(TicketService.class);
        commentService = mock(TicketCommentService.class);
        attachmentService = mock(TicketAttachmentService.class);
        authenticatedUserService = mock(AuthenticatedUserService.class);
        authentication = mock(Authentication.class);

        when(authenticatedUserService.getCurrentUserId(authentication)).thenReturn(20L);

        ticketController = new TicketController(ticketService, commentService, attachmentService, authenticatedUserService);
        adminController = new AdminTicketController(ticketService, authenticatedUserService);
        technicianController = new TechnicianTicketController(ticketService, authenticatedUserService);
    }

    @Test
    void listEndpointsReturnPaginatedNoStoreResponses() {
        var page = new PageImpl<>(List.of(ticket()), PageRequest.of(0, 10), 1);
        when(ticketService.getAllTickets(eq(20L), any(), any(), any(), eq(0), eq(10))).thenReturn(page);
        when(ticketService.getMyVisibleTickets(20L, 0, 10)).thenReturn(page);
        when(ticketService.getTechnicianTickets(eq(20L), any(), eq(false), eq(false), eq(0), eq(10))).thenReturn(page);

        var all = ticketController.getAllTickets(authentication, TicketScope.ALL, null, null, null, false, false, 0, 10);
        var mine = ticketController.getMyTickets(authentication, 0, 10);
        var assigned = technicianController.getTechnicianTickets(authentication, null, false, false, 0, 10);

        assertEquals(1, all.getBody().getTotalElements());
        assertEquals(1, mine.getBody().getContent().size());
        assertEquals(1, assigned.getBody().getTotalPages());
        assertNoStore(all);
        assertNoStore(mine);
        assertNoStore(assigned);
    }

    @Test
    void resourceScopedTicketEndpointSupportsAssignedToMeWithoutRoleUrl() {
        var page = new PageImpl<>(List.of(ticket()), PageRequest.of(0, 10), 1);
        when(ticketService.getTechnicianTickets(eq(20L), any(), eq(true), eq(false), eq(0), eq(10))).thenReturn(page);

        var response = ticketController.getAllTickets(
                authentication,
                TicketScope.ASSIGNED_TO_ME,
                null,
                null,
                null,
                true,
                false,
                0,
                10
        );

        assertEquals(1, response.getBody().getTotalElements());
        assertNoStore(response);
    }

    @Test
    void lookupEndpointIsExplicitlyCacheable() {
        when(ticketService.getSkillsForResource(100L)).thenReturn(List.of(new SkillOptionResponse(200L, "IT_SUPPORT")));

        var response = ticketController.getSkillsForResource(100L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getHeaders().getCacheControl().contains("max-age=300"));
    }

    @Test
    void ticketCrudAndStateEndpointsUseRestfulStatuses() {
        TicketResponse created = ticket();
        created.setId(99L);
        when(ticketService.createTicket(eq(20L), any())).thenReturn(created);
        when(ticketService.getTicketByIdVisibleToUser(99L, 20L)).thenReturn(created);
        when(ticketService.updateTicket(eq(99L), any(), eq(20L))).thenReturn(created);
        when(ticketService.updateStatus(eq(99L), any(), eq(20L))).thenReturn(created);
        when(ticketService.updateResolutionNotes(eq(99L), any(), eq(20L))).thenReturn(created);
        when(ticketService.extendDueDate(eq(99L), any(), eq(20L))).thenReturn(created);

        var create = ticketController.createTicket(authentication, request());
        var get = ticketController.getTicketById(99L, authentication);
        var put = ticketController.updateTicket(99L, authentication, request());
        var patch = ticketController.updateTicketStatus(99L, authentication, statusRequest(TicketStatus.IN_PROGRESS));
        var resolution = ticketController.updateTicketResolution(99L, authentication, resolutionRequest());
        var dueDate = ticketController.updateTicketDueDate(99L, authentication, dueDateRequest());
        var delete = ticketController.deleteTicket(99L, authentication);

        assertEquals(HttpStatus.CREATED, create.getStatusCode());
        assertEquals(URI.create("/api/v1/tickets/99"), create.getHeaders().getLocation());
        assertEquals(HttpStatus.OK, get.getStatusCode());
        assertEquals(HttpStatus.OK, put.getStatusCode());
        assertEquals(HttpStatus.OK, patch.getStatusCode());
        assertEquals(HttpStatus.OK, resolution.getStatusCode());
        assertEquals(HttpStatus.OK, dueDate.getStatusCode());
        assertEquals(HttpStatus.NO_CONTENT, delete.getStatusCode());
        assertNoStore(create);
        assertNoStore(get);
        assertNoStore(delete);
    }

    @Test
    void ticketResponsesExposeHypermediaLinks() {
        TicketResponse ticket = ticket();

        assertEquals("/api/v1/tickets/1", ticket.getLinks().get("self"));
        assertEquals("/api/v1/tickets/1/comments", ticket.getLinks().get("comments"));
        assertEquals("/api/v1/tickets/1/attachments", ticket.getLinks().get("attachments"));
        assertEquals("/api/v1/tickets/1/assignment", ticket.getLinks().get("assignment"));
    }

    @Test
    void commentEndpointsUseNestedResources() {
        TicketCommentResponse comment = new TicketCommentResponse();
        comment.setId(7L);
        when(commentService.getComments(99L, 20L)).thenReturn(List.of(comment));
        when(commentService.addComment(eq(99L), eq(20L), any())).thenReturn(comment);
        when(commentService.updateComment(eq(99L), eq(7L), eq(20L), any())).thenReturn(comment);

        var get = ticketController.getComments(99L, authentication);
        var post = ticketController.addComment(99L, authentication, commentRequest());
        var put = ticketController.updateComment(99L, 7L, authentication, commentRequest());
        var delete = ticketController.deleteComment(99L, 7L, authentication);

        assertEquals(HttpStatus.OK, get.getStatusCode());
        assertEquals(HttpStatus.CREATED, post.getStatusCode());
        assertEquals(HttpStatus.OK, put.getStatusCode());
        assertEquals(HttpStatus.NO_CONTENT, delete.getStatusCode());
        assertNoStore(post);
        assertNoStore(delete);
    }

    @Test
    void attachmentEndpointsUseNestedResourcesAndNoStore() {
        List<String> urls = List.of("http://localhost:8081/uploads/tickets/99/image.png");
        List<MultipartFile> files = List.of(new MockMultipartFile("files", "image.png", "image/png", new byte[]{1}));
        when(attachmentService.get(99L, 20L)).thenReturn(urls);
        when(attachmentService.upload(99L, 20L, files)).thenReturn(urls);

        var get = ticketController.getAttachments(99L, authentication);
        var post = ticketController.uploadAttachments(99L, authentication, files);
        var delete = ticketController.deleteAttachment(99L, authentication, urls.get(0));

        assertEquals(HttpStatus.OK, get.getStatusCode());
        assertEquals(HttpStatus.CREATED, post.getStatusCode());
        assertEquals(HttpStatus.NO_CONTENT, delete.getStatusCode());
        assertNoStore(get);
        assertNoStore(post);
        assertNoStore(delete);
    }

    @Test
    void adminAssignmentEndpointsAreVersionedResources() {
        TicketResponse ticket = ticket();
        when(ticketService.getAssignableTechnicians(99L, 20L))
                .thenReturn(List.of(new TechnicianOptionResponse(30L, "Tech User", "tech@test.com")));
        when(ticketService.assignTicket(eq(99L), eq(20L), any())).thenReturn(ticket);

        var technicians = adminController.getAssignableTechnicians(99L, authentication);
        var assignment = adminController.assignTicket(99L, authentication, assignRequest());

        assertEquals(HttpStatus.OK, technicians.getStatusCode());
        assertTrue(technicians.getHeaders().getCacheControl().contains("max-age=120"));
        assertEquals(HttpStatus.OK, assignment.getStatusCode());
        assertNoStore(assignment);
    }

    @Test
    void assignmentEndpointsAreAvailableOnTicketResource() {
        TicketResponse ticket = ticket();
        when(ticketService.getAssignableTechnicians(99L, 20L))
                .thenReturn(List.of(new TechnicianOptionResponse(30L, "Tech User", "tech@test.com")));
        when(ticketService.assignTicket(eq(99L), eq(20L), any())).thenReturn(ticket);

        var technicians = ticketController.getAssignableTechnicians(99L, authentication);
        var assignment = ticketController.assignTicket(99L, authentication, assignRequest());

        assertEquals(HttpStatus.OK, technicians.getStatusCode());
        assertTrue(technicians.getHeaders().getCacheControl().contains("max-age=120"));
        assertEquals(HttpStatus.OK, assignment.getStatusCode());
        assertNoStore(assignment);
    }

    private TicketResponse ticket() {
        TicketResponse response = new TicketResponse();
        response.setId(1L);
        response.setTitle("Projector issue");
        response.setStatus(TicketStatus.OPEN);
        response.setPriority(TicketPriority.HIGH);
        response.setReportedBy(20L);
        response.setLinks(java.util.Map.of(
                "self", "/api/v1/tickets/1",
                "collection", "/api/v1/tickets",
                "comments", "/api/v1/tickets/1/comments",
                "attachments", "/api/v1/tickets/1/attachments",
                "assignment", "/api/v1/tickets/1/assignment"
        ));
        return response;
    }

    private TicketRequest request() {
        TicketRequest request = new TicketRequest();
        request.setTitle("Projector issue");
        request.setLocation("A401");
        request.setCategory("PROJECTOR");
        request.setDescription("Projector does not turn on");
        request.setResourceId(100L);
        request.setRequiredSkillId(200L);
        request.setPriority(TicketPriority.HIGH);
        request.setPreferredContact("reporter@test.com");
        return request;
    }

    private TicketStatusUpdateRequest statusRequest(TicketStatus status) {
        TicketStatusUpdateRequest request = new TicketStatusUpdateRequest();
        request.setStatus(status);
        return request;
    }

    private TicketResolutionUpdateRequest resolutionRequest() {
        TicketResolutionUpdateRequest request = new TicketResolutionUpdateRequest();
        request.setResolutionNotes("Cable replaced and tested");
        return request;
    }

    private TicketDueDateUpdateRequest dueDateRequest() {
        TicketDueDateUpdateRequest request = new TicketDueDateUpdateRequest();
        request.setDueAt(java.time.LocalDateTime.now().plusDays(2));
        request.setNote("Awaiting spare part");
        return request;
    }

    private TicketCommentRequest commentRequest() {
        TicketCommentRequest request = new TicketCommentRequest();
        request.setContent("Initial comment");
        return request;
    }

    private TicketAssignRequest assignRequest() {
        TicketAssignRequest request = new TicketAssignRequest();
        request.setAssignedTo(30L);
        return request;
    }

    private void assertNoStore(org.springframework.http.ResponseEntity<?> response) {
        assertTrue(response.getHeaders().getCacheControl().contains("no-store"));
    }
}
