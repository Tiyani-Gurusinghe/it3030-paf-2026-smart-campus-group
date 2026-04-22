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
import lk.sliit.smartcampus.ticket.repository.TicketAttachmentRepository;
import lk.sliit.smartcampus.ticket.repository.TicketRepository;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@Service
public class TicketValidationService {

    private final TicketRepository ticketRepository;
    private final TicketAttachmentRepository ticketAttachmentRepository;
    private final TechnicianSkillRepository technicianSkillRepository;
    private final ResourceTypeSkillRepository resourceTypeSkillRepository;
    private final JdbcTemplate jdbcTemplate;

    public TicketValidationService(TicketRepository ticketRepository,
                                   TicketAttachmentRepository ticketAttachmentRepository,
                                   TechnicianSkillRepository technicianSkillRepository,
                                   ResourceTypeSkillRepository resourceTypeSkillRepository,
                                   JdbcTemplate jdbcTemplate) {
        this.ticketRepository = ticketRepository;
        this.ticketAttachmentRepository = ticketAttachmentRepository;
        this.technicianSkillRepository = technicianSkillRepository;
        this.resourceTypeSkillRepository = resourceTypeSkillRepository;
        this.jdbcTemplate = jdbcTemplate;
    }

    public void validateCreateRequest(TicketRequest request) {
        validateTitleAndDescription(request.getTitle(), request.getDescription());
        validateResourceExistsAndActive(request.getResourceId());
        validateSkillAllowedForResourceType(request.getResourceId(), request.getRequiredSkillId());
    }

    public void validateTitleAndDescription(String title, String description) {
        if (title == null || title.isBlank()) {
            throw new BadRequestException("Title is required");
        }
        if (title.length() > 120) {
            throw new BadRequestException("Title must be at most 120 characters");
        }
        if (description == null || description.isBlank()) {
            throw new BadRequestException("Description is required");
        }
        if (description.length() > 2000) {
            throw new BadRequestException("Description must be at most 2000 characters");
        }
    }

    public void validateTicketExists(Long ticketId) {
        if (!ticketRepository.existsById(ticketId)) {
            throw new ResourceNotFoundException("Ticket not found: " + ticketId);
        }
    }

    public void validateResourceExistsAndActive(Long resourceId) {
        List<Map<String, Object>> rows = jdbcTemplate.queryForList(
                "SELECT id, status FROM resources WHERE id = ?",
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
                "SELECT resource_type FROM resources WHERE id = ?",
                resourceId
        );

        if (rows.isEmpty()) {
            throw new ResourceNotFoundException("Resource not found: " + resourceId);
        }

        String resourceTypeValue = String.valueOf(rows.get(0).get("resource_type"));

        ResourceType resourceType;
        try {
            resourceType = ResourceType.valueOf(resourceTypeValue);
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid resource type found in database: " + resourceTypeValue);
        }

        boolean allowed = resourceTypeSkillRepository.existsByResourceTypeAndSkillId(resourceType, skillId);
        if (!allowed) {
            throw new BadRequestException("Selected skill is not allowed for this resource type");
        }
    }

    public void validateTechnicianHasSkill(Long technicianId, Long skillId) {
        boolean hasSkill = technicianSkillRepository.existsByUserIdAndSkillId(technicianId, skillId);
        if (!hasSkill) {
            throw new BadRequestException("Assigned technician does not have the required skill");
        }
    }

    public void validateAttachmentUpload(Long ticketId, List<MultipartFile> files) {
        validateTicketExists(ticketId);

        if (files == null || files.isEmpty()) {
            throw new BadRequestException("No files provided");
        }

        long existing = ticketAttachmentRepository.countByTicketId(ticketId);
        if (existing + files.size() > 3) {
            throw new BadRequestException("A ticket can have at most 3 attachments");
        }

        for (MultipartFile file : files) {
            if (file == null || file.isEmpty()) {
                continue;
            }
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                throw new BadRequestException("Only image files are allowed. Got: " + contentType);
            }
        }
    }

    public void validateStatusTransition(Ticket ticket, TicketStatus newStatus, RoleType roleType) {
        TicketStatus current = ticket.getStatus();

        if (current == newStatus) {
            return;
        }

        switch (current) {
            case OPEN -> validateFromOpen(newStatus, roleType);
            case IN_PROGRESS -> validateFromInProgress(newStatus, roleType);
            case RESOLVED -> validateFromResolved(newStatus, roleType);
            case CLOSED, REJECTED -> throw new BadRequestException("Closed or rejected tickets cannot be changed");
            default -> throw new BadRequestException("Invalid current ticket status");
        }
    }

    private void validateFromOpen(TicketStatus newStatus, RoleType roleType) {
        if (newStatus == TicketStatus.IN_PROGRESS && (roleType == RoleType.ADMIN || roleType == RoleType.TECHNICIAN)) {
            return;
        }
        if (newStatus == TicketStatus.REJECTED && roleType == RoleType.ADMIN) {
            return;
        }
        throw new BadRequestException("Invalid status transition from OPEN");
    }

    private void validateFromInProgress(TicketStatus newStatus, RoleType roleType) {
        if (newStatus == TicketStatus.RESOLVED && (roleType == RoleType.ADMIN || roleType == RoleType.TECHNICIAN)) {
            return;
        }
        if (newStatus == TicketStatus.REJECTED && roleType == RoleType.ADMIN) {
            return;
        }
        throw new BadRequestException("Invalid status transition from IN_PROGRESS");
    }

    private void validateFromResolved(TicketStatus newStatus, RoleType roleType) {
        if (newStatus == TicketStatus.CLOSED && roleType == RoleType.ADMIN) {
            return;
        }
        throw new BadRequestException("Invalid status transition from RESOLVED");
    }
}