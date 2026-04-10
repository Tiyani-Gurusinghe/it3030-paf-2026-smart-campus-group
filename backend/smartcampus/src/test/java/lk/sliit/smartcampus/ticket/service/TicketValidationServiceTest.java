package lk.sliit.smartcampus.ticket.service;

import lk.sliit.smartcampus.exception.BadRequestException;
import lk.sliit.smartcampus.exception.ResourceNotFoundException;
import lk.sliit.smartcampus.ticket.dto.TicketRequest;
import lk.sliit.smartcampus.ticket.entity.TicketPriority;
import lk.sliit.smartcampus.ticket.entity.TicketResourceType;
import lk.sliit.smartcampus.ticket.repository.ResourceTypeSkillRepository;
import lk.sliit.smartcampus.ticket.repository.TechnicianSkillRepository;
import lk.sliit.smartcampus.ticket.repository.TicketAttachmentRepository;
import lk.sliit.smartcampus.ticket.repository.TicketRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class TicketValidationServiceTest {

    private TicketRepository ticketRepository;
    private TicketAttachmentRepository ticketAttachmentRepository;
    private TechnicianSkillRepository technicianSkillRepository;
    private ResourceTypeSkillRepository resourceTypeSkillRepository;
    private JdbcTemplate jdbcTemplate;
    private TicketValidationService service;

    @BeforeEach
    void setUp() {
        ticketRepository = mock(TicketRepository.class);
        ticketAttachmentRepository = mock(TicketAttachmentRepository.class);
        technicianSkillRepository = mock(TechnicianSkillRepository.class);
        resourceTypeSkillRepository = mock(ResourceTypeSkillRepository.class);
        jdbcTemplate = mock(JdbcTemplate.class);

        service = new TicketValidationService(
                ticketRepository,
                ticketAttachmentRepository,
                technicianSkillRepository,
                resourceTypeSkillRepository,
                jdbcTemplate
        );
    }

    @Test
    void createRejectsInvalidSkillResourceCombo() {
        TicketRequest request = new TicketRequest();
        request.setTitle("Test");
        request.setDescription("Test desc");
        request.setResourceId(1L);
        request.setRequiredSkillId(2L);
        request.setPriority(TicketPriority.HIGH);

        when(jdbcTemplate.queryForList("SELECT id, status FROM resources WHERE id = ?", 1L))
                .thenReturn(List.of(Map.of("id", 1L, "status", "ACTIVE")));

        when(jdbcTemplate.queryForList("SELECT resource_type FROM resources WHERE id = ?", 1L))
                .thenReturn(List.of(Map.of("resource_type", "LECTURE_HALL")));

        when(resourceTypeSkillRepository.existsByResourceTypeAndSkillId(TicketResourceType.LECTURE_HALL, 2L))
                .thenReturn(false);

        assertThrows(BadRequestException.class, () -> service.validateCreateRequest(request));
    }

    @Test
    void attachmentRejectsMoreThanThreeFiles() {
        when(ticketRepository.existsById(1L)).thenReturn(true);
        when(ticketAttachmentRepository.countByTicketId(1L)).thenReturn(2L);

        MultipartFile f1 = mock(MultipartFile.class);
        MultipartFile f2 = mock(MultipartFile.class);

        when(f1.isEmpty()).thenReturn(false);
        when(f2.isEmpty()).thenReturn(false);
        when(f1.getContentType()).thenReturn("image/png");
        when(f2.getContentType()).thenReturn("image/png");

        assertThrows(BadRequestException.class,
                () -> service.validateAttachmentUpload(1L, List.of(f1, f2)));
    }

    @Test
    void attachmentRejectsNonImageFiles() {
        when(ticketRepository.existsById(1L)).thenReturn(true);
        when(ticketAttachmentRepository.countByTicketId(1L)).thenReturn(0L);

        MultipartFile file = mock(MultipartFile.class);
        when(file.isEmpty()).thenReturn(false);
        when(file.getContentType()).thenReturn("text/plain");

        assertThrows(BadRequestException.class,
                () -> service.validateAttachmentUpload(1L, List.of(file)));
    }

    @Test
    void missingResourceThrowsNotFound() {
        when(jdbcTemplate.queryForList("SELECT id, status FROM resources WHERE id = ?", 10L))
                .thenReturn(List.of());

        assertThrows(ResourceNotFoundException.class,
                () -> service.validateResourceExistsAndActive(10L));
    }
}