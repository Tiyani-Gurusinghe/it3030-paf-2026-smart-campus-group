package lk.sliit.smartcampus.ticket.service;

import lk.sliit.smartcampus.common.enums.RoleType;
import lk.sliit.smartcampus.exception.BadRequestException;
import lk.sliit.smartcampus.exception.ResourceNotFoundException;
import lk.sliit.smartcampus.resource.enums.ResourceType;
import lk.sliit.smartcampus.ticket.dto.TicketRequest;
import lk.sliit.smartcampus.ticket.entity.Ticket;
import lk.sliit.smartcampus.ticket.entity.TicketStatus;
import lk.sliit.smartcampus.ticket.repository.ResourceTypeSkillRepository;
import lk.sliit.smartcampus.ticket.repository.TechnicianSkillRepository;
import lk.sliit.smartcampus.ticket.repository.TicketRepository;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@Service
public class TicketValidationService {
    private static final int MAX_FILES = 3;
    private static final long MAX_FILE_BYTES = 5L * 1024L * 1024L;
    private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/webp"
    );

    private final TicketRepository ticketRepository;
    private final TechnicianSkillRepository technicianSkillRepository;
    private final ResourceTypeSkillRepository resourceTypeSkillRepository;
    private final JdbcTemplate jdbcTemplate;

    public TicketValidationService(
            TicketRepository ticketRepository,
            TechnicianSkillRepository technicianSkillRepository,
            ResourceTypeSkillRepository resourceTypeSkillRepository,
            JdbcTemplate jdbcTemplate) {
        this.ticketRepository = ticketRepository;
        this.technicianSkillRepository = technicianSkillRepository;
        this.resourceTypeSkillRepository = resourceTypeSkillRepository;
        this.jdbcTemplate = jdbcTemplate;
    }

    public void validateCreateRequest(TicketRequest request) {
        validateText(request);
        validateResourceExistsAndActive(request.getResourceId());
        validateSkillAllowedForResourceType(
                request.getResourceId(),
                request.getRequiredSkillId()
        );
    }

    private void validateText(TicketRequest request) {
        if (request.getTitle() == null || request.getTitle().isBlank()) {
            throw new BadRequestException("Title is required");
        }

        if (request.getDescription() == null || request.getDescription().isBlank()) {
            throw new BadRequestException("Description is required");
        }

        if (request.getDescription().length() > 1000) {
            throw new BadRequestException("Description max length is 1000");
        }
    }

    public void validateTicketExists(Long ticketId) {
        if (!ticketRepository.existsById(ticketId)) {
            throw new ResourceNotFoundException("Ticket not found: " + ticketId);
        }
    }

    public void validateResourceExistsAndActive(Long resourceId) {
        List<Map<String, Object>> rows = jdbcTemplate.queryForList(
                "SELECT id,status FROM resources WHERE id=?",
                resourceId
        );

        if (rows.isEmpty()) {
            throw new ResourceNotFoundException("Resource not found: " + resourceId);
        }

        String status = String.valueOf(rows.get(0).get("status"));

        if (!"ACTIVE".equalsIgnoreCase(status)) {
            throw new BadRequestException("Selected resource is not active");
        }
    }

    public void validateSkillAllowedForResourceType(Long resourceId, Long skillId) {
        List<Map<String, Object>> rows = jdbcTemplate.queryForList(
                "SELECT resource_type FROM resources WHERE id=?",
                resourceId
        );

        if (rows.isEmpty()) {
            throw new ResourceNotFoundException("Resource not found: " + resourceId);
        }

        String type = String.valueOf(rows.get(0).get("resource_type"));

        ResourceType resourceType = ResourceType.valueOf(type);

        boolean allowed =
                resourceTypeSkillRepository.existsByResourceTypeAndSkillId(
                        resourceType,
                        skillId
                );

        if (!allowed) {
            throw new BadRequestException(
                    "Selected skill is not allowed for this resource type"
            );
        }
    }

    public void validateTechnicianHasSkill(Long technicianId, Long skillId) {
        boolean hasSkill =
                technicianSkillRepository.existsByUserIdAndSkillId(
                        technicianId,
                        skillId
                );

        if (!hasSkill) {
            throw new BadRequestException(
                    "Assigned technician does not have the required skill"
            );
        }
    }

    public void validateFiles(List<MultipartFile> files) {
        if (files == null || files.isEmpty()) {
            return;
        }

        if (files.size() > MAX_FILES) {
            throw new BadRequestException("Maximum 3 files allowed");
        }

        for (MultipartFile file : files) {
            if (file.isEmpty()) continue;

            String type = file.getContentType() == null
                    ? ""
                    : file.getContentType().toLowerCase(Locale.ROOT).trim();

            if (!ALLOWED_IMAGE_TYPES.contains(type)) {
                throw new BadRequestException("Only JPEG, PNG, GIF, or WEBP images are allowed");
            }

            if (file.getSize() > MAX_FILE_BYTES) {
                throw new BadRequestException("Each file must be 5MB or smaller");
            }
        }
    }

    public void validateCumulativeFileLimit(int existingCount, List<MultipartFile> files) {
        if (files == null || files.isEmpty()) {
            return;
        }

        long incomingCount = files.stream().filter(file -> !file.isEmpty()).count();
        if (existingCount + incomingCount > MAX_FILES) {
            throw new BadRequestException("A ticket can have at most 3 attachments");
        }
    }

    public void validateStatusTransition(
            Ticket ticket,
            TicketStatus newStatus,
            RoleType roleType
    ) {
        TicketStatus current = ticket.getStatus();

        if (current == newStatus) {
            return;
        }

        switch (current) {
            case OPEN -> validateFromOpen(newStatus, roleType);
            case IN_PROGRESS -> validateFromInProgress(newStatus, roleType);
            case RESOLVED -> validateFromResolved(newStatus, roleType);
            case CLOSED, REJECTED ->
                    throw new BadRequestException("Closed/rejected ticket cannot change");
        }
    }

    private void validateFromOpen(TicketStatus next, RoleType role) {
        if (next == TicketStatus.IN_PROGRESS &&
                (role == RoleType.ADMIN || role == RoleType.TECHNICIAN)) return;

        if (next == TicketStatus.REJECTED &&
                role == RoleType.ADMIN) return;

        throw new BadRequestException("Invalid status transition from OPEN");
    }

    private void validateFromInProgress(TicketStatus next, RoleType role) {
        if (next == TicketStatus.RESOLVED &&
                (role == RoleType.ADMIN || role == RoleType.TECHNICIAN)) return;

        if (next == TicketStatus.REJECTED &&
                role == RoleType.ADMIN) return;

        throw new BadRequestException("Invalid status transition from IN_PROGRESS");
    }

    private void validateFromResolved(TicketStatus next, RoleType role) {
        if (next == TicketStatus.CLOSED &&
                role == RoleType.ADMIN) return;

        throw new BadRequestException("Invalid status transition from RESOLVED");
    }
}
