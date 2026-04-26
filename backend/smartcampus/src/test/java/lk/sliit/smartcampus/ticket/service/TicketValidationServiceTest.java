package lk.sliit.smartcampus.ticket.service;

import lk.sliit.smartcampus.exception.BadRequestException;
import lk.sliit.smartcampus.exception.ResourceNotFoundException;
import lk.sliit.smartcampus.resource.enums.ResourceType;
import lk.sliit.smartcampus.ticket.dto.TicketRequest;
import lk.sliit.smartcampus.ticket.entity.TicketPriority;
import lk.sliit.smartcampus.ticket.repository.ResourceTypeSkillRepository;
import lk.sliit.smartcampus.ticket.repository.TechnicianSkillRepository;
import lk.sliit.smartcampus.ticket.repository.TicketRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class TicketValidationServiceTest {

    private TicketRepository ticketRepository;
    private TechnicianSkillRepository technicianSkillRepository;
    private ResourceTypeSkillRepository resourceTypeSkillRepository;
    private JdbcTemplate jdbcTemplate;
    private TicketValidationService service;

    @BeforeEach
    void setUp() {
        ticketRepository = mock(TicketRepository.class);
        technicianSkillRepository = mock(TechnicianSkillRepository.class);
        resourceTypeSkillRepository = mock(ResourceTypeSkillRepository.class);
        jdbcTemplate = mock(JdbcTemplate.class);

        service = new TicketValidationService(
                ticketRepository,
                technicianSkillRepository,
                resourceTypeSkillRepository,
                jdbcTemplate
        );
    }

    @Test
    // Test proof: validation service rejects invalid skill-resource mappings.
    void createRejectsInvalidSkillResourceCombo() {
        TicketRequest request = new TicketRequest();
        request.setTitle("Test");
        request.setLocation("Hall A");
        request.setCategory("FACILITY");
        request.setDescription("Test desc");
        request.setResourceId(1L);
        request.setRequiredSkillId(2L);
        request.setPriority(TicketPriority.HIGH);
        request.setPreferredContact("user@test.com");

        when(jdbcTemplate.queryForList("SELECT id,status FROM resources WHERE id=?", 1L))
                .thenReturn(List.of(Map.of("id", 1L, "status", "ACTIVE")));

        when(jdbcTemplate.queryForList("SELECT resource_type FROM resources WHERE id=?", 1L))
                .thenReturn(List.of(Map.of("resource_type", "LECTURE_HALL")));

        when(resourceTypeSkillRepository.existsByResourceTypeAndSkillId(ResourceType.LECTURE_HALL, 2L))
                .thenReturn(false);

        assertThrows(BadRequestException.class, () -> service.validateCreateRequest(request));
    }

    @Test
    // Test proof: valid required fields, active resource, and matching skill pass validation.
    void createAllowsValidSkillResourceCombo() {
        TicketRequest request = new TicketRequest();
        request.setTitle("Valid ticket");
        request.setLocation("Auditorium");
        request.setCategory("EQUIPMENT");
        request.setDescription("Valid description");
        request.setResourceId(7L);
        request.setRequiredSkillId(2L);
        request.setPriority(TicketPriority.HIGH);
        request.setPreferredContact("user@test.com");

        when(jdbcTemplate.queryForList("SELECT id,status FROM resources WHERE id=?", 7L))
                .thenReturn(List.of(Map.of("id", 7L, "status", "ACTIVE")));

        when(jdbcTemplate.queryForList("SELECT resource_type FROM resources WHERE id=?", 7L))
                .thenReturn(List.of(Map.of("resource_type", "PROJECTOR")));

        when(resourceTypeSkillRepository.existsByResourceTypeAndSkillId(ResourceType.PROJECTOR, 2L))
                .thenReturn(true);

        assertDoesNotThrow(() -> service.validateCreateRequest(request));
    }

    @Test
    // Test proof: max 3 attachments rule is enforced.
    void fileValidationRejectsMoreThanThreeFiles() {
        MultipartFile f1 = mock(MultipartFile.class);
        MultipartFile f2 = mock(MultipartFile.class);
        MultipartFile f3 = mock(MultipartFile.class);
        MultipartFile f4 = mock(MultipartFile.class);

        assertThrows(BadRequestException.class,
                () -> service.validateFiles(List.of(f1, f2, f3, f4)));
    }

    @Test
    // Test proof: non-image file uploads are rejected.
    void fileValidationRejectsNonImageFiles() {
        MultipartFile file = mock(MultipartFile.class);
        when(file.isEmpty()).thenReturn(false);
        when(file.getContentType()).thenReturn("text/plain");

        assertThrows(BadRequestException.class,
                () -> service.validateFiles(List.of(file)));
    }

    @Test
    // Test proof: missing resource returns not-found validation behavior.
    void missingResourceThrowsNotFound() {
        when(jdbcTemplate.queryForList("SELECT id,status FROM resources WHERE id=?", 10L))
                .thenReturn(List.of());

        assertThrows(ResourceNotFoundException.class,
                () -> service.validateResourceExistsAndActive(10L));
    }
}
