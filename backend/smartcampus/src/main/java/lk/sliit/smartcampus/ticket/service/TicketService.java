package lk.sliit.smartcampus.ticket.service;

import lk.sliit.smartcampus.common.enums.RoleType;
import lk.sliit.smartcampus.exception.BadRequestException;
import lk.sliit.smartcampus.exception.ResourceNotFoundException;
import lk.sliit.smartcampus.notification.entity.NotificationType;
import lk.sliit.smartcampus.notification.service.NotificationService;
import lk.sliit.smartcampus.ticket.dto.TicketAttachmentResponse;
import lk.sliit.smartcampus.ticket.dto.TicketRequest;
import lk.sliit.smartcampus.ticket.dto.TicketResponse;
import lk.sliit.smartcampus.ticket.dto.TicketStatusUpdateRequest;
import lk.sliit.smartcampus.ticket.entity.Ticket;
import lk.sliit.smartcampus.ticket.entity.TicketAssignmentHistory;
import lk.sliit.smartcampus.ticket.entity.TicketPriority;
import lk.sliit.smartcampus.ticket.entity.TicketStatus;
import lk.sliit.smartcampus.ticket.repository.TechnicianSkillRepository;
import lk.sliit.smartcampus.ticket.repository.TicketAssignmentHistoryRepository;
import lk.sliit.smartcampus.ticket.repository.TicketAttachmentRepository;
import lk.sliit.smartcampus.ticket.repository.TicketCommentRepository;
import lk.sliit.smartcampus.ticket.repository.TicketRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;
    private final TicketCommentRepository commentRepository;
    private final TicketAttachmentRepository attachmentRepository;
    private final TicketAssignmentHistoryRepository ticketAssignmentHistoryRepository;
    private final TechnicianSkillRepository technicianSkillRepository;
    private final NotificationService notificationService;
    private final TicketValidationService ticketValidationService;

    public TicketService(TicketRepository ticketRepository,
                         TicketCommentRepository commentRepository,
                         TicketAttachmentRepository attachmentRepository,
                         TicketAssignmentHistoryRepository ticketAssignmentHistoryRepository,
                         TechnicianSkillRepository technicianSkillRepository,
                         NotificationService notificationService,
                         TicketValidationService ticketValidationService) {
        this.ticketRepository = ticketRepository;
        this.commentRepository = commentRepository;
        this.attachmentRepository = attachmentRepository;
        this.ticketAssignmentHistoryRepository = ticketAssignmentHistoryRepository;
        this.technicianSkillRepository = technicianSkillRepository;
        this.notificationService = notificationService;
        this.ticketValidationService = ticketValidationService;
    }

    public List<TicketResponse> getAllTickets(TicketStatus status,
                                              TicketPriority priority,
                                              Long reportedBy) {
        return ticketRepository.findWithFilters(status, priority, reportedBy)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public TicketResponse getTicketById(Long id) {
        return toResponse(findByIdOrThrow(id));
    }

    @Transactional
    public TicketResponse createTicket(TicketRequest request) {
        ticketValidationService.validateCreateRequest(request);

        Long currentUserId = request.getReportedBy();
        if (currentUserId == null) {
            throw new BadRequestException("Reported by is required");
        }

        Ticket ticket = new Ticket();
        ticket.setTitle(request.getTitle());
        ticket.setDescription(request.getDescription());
        ticket.setResourceId(request.getResourceId());
        ticket.setRequiredSkillId(request.getRequiredSkillId());
        ticket.setPriority(request.getPriority());
        ticket.setReportedBy(currentUserId);
        ticket.setStatus(TicketStatus.OPEN);
        ticket.setDueAt(calculateDueDate(request.getPriority()));

        Long assignedTechnicianId = findLeastBusyTechnician(request.getRequiredSkillId());
        if (assignedTechnicianId != null) {
            ticket.setAssignedTo(assignedTechnicianId);
        }

        Ticket saved = ticketRepository.save(ticket);

        if (assignedTechnicianId != null) {
            TicketAssignmentHistory history = new TicketAssignmentHistory();
            history.setTicketId(saved.getId());
            history.setFromUserId(null);
            history.setToUserId(assignedTechnicianId);
            history.setChangedBy(currentUserId);
            ticketAssignmentHistoryRepository.save(history);

            notificationService.createNotification(
                    currentUserId,
                    NotificationType.TICKET_ASSIGNED,
                    "Your ticket \"" + saved.getTitle() + "\" has been assigned automatically.",
                    saved.getId()
            );
        }

        return toResponse(saved);
    }

    public TicketResponse updateTicket(Long id, TicketRequest request) {
        Ticket ticket = findByIdOrThrow(id);

        ticketValidationService.validateTitleAndDescription(request.getTitle(), request.getDescription());

        ticket.setTitle(request.getTitle());
        ticket.setDescription(request.getDescription());
        ticket.setPriority(request.getPriority());

        return toResponse(ticketRepository.save(ticket));
    }

    @Transactional
    public TicketResponse updateTicketStatus(Long id, Long performedBy, TicketStatusUpdateRequest request) {
        Ticket ticket = findByIdOrThrow(id);

        RoleType roleType = resolveRoleForStatusChange(ticket, performedBy, request);
        ticketValidationService.validateStatusTransition(ticket, request.getStatus(), roleType);

        TicketStatus oldStatus = ticket.getStatus();
        ticket.setStatus(request.getStatus());

        if (request.getAssignedTo() != null) {
            ticketValidationService.validateTechnicianHasSkill(request.getAssignedTo(), ticket.getRequiredSkillId());

            Long oldAssignedTo = ticket.getAssignedTo();
            ticket.setAssignedTo(request.getAssignedTo());

            if (oldAssignedTo == null || !oldAssignedTo.equals(request.getAssignedTo())) {
                TicketAssignmentHistory history = new TicketAssignmentHistory();
                history.setTicketId(ticket.getId());
                history.setFromUserId(oldAssignedTo);
                history.setToUserId(request.getAssignedTo());
                history.setChangedBy(performedBy);
                ticketAssignmentHistoryRepository.save(history);
            }
        }

        if (request.getStatus() == TicketStatus.REJECTED &&
                (request.getRejectedReason() == null || request.getRejectedReason().isBlank())) {
            throw new BadRequestException("Rejected reason is required when rejecting a ticket");
        }

        if (request.getResolutionNotes() != null) {
            ticket.setResolutionNotes(request.getResolutionNotes());
        }

        if (ticket.getFirstResponseAt() == null) {
            ticket.setFirstResponseAt(LocalDateTime.now());
            ticket.setFirstRespondedBy(performedBy);
        }

        if (request.getStatus() == TicketStatus.RESOLVED) {
            ticket.setResolvedAt(LocalDateTime.now());
        }

        if (request.getStatus() == TicketStatus.CLOSED) {
            ticket.setClosedAt(LocalDateTime.now());
        }

        if (request.getStatus() == TicketStatus.REJECTED) {
            ticket.setRejectedReason(request.getRejectedReason());
        }

        Ticket saved = ticketRepository.save(ticket);

        if (!oldStatus.equals(request.getStatus())) {
            notificationService.createNotification(
                    ticket.getReportedBy(),
                    NotificationType.TICKET_STATUS_CHANGED,
                    "Ticket \"" + ticket.getTitle() + "\" changed to " + request.getStatus(),
                    id
            );
        }

        return toResponse(saved);
    }

    public void deleteTicket(Long id) {
        ticketRepository.delete(findByIdOrThrow(id));
    }

    private Ticket findByIdOrThrow(Long id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + id));
    }

    private LocalDateTime calculateDueDate(TicketPriority priority) {
        LocalDateTime now = LocalDateTime.now();
        return switch (priority) {
            case HIGH -> now.plusHours(4);
            case MEDIUM -> now.plusDays(1);
            case LOW -> now.plusDays(3);
        };
    }

    private Long findLeastBusyTechnician(Long requiredSkillId) {
        List<Long> technicianIds = technicianSkillRepository.findTechnicianIdsBySkillId(requiredSkillId);

        if (technicianIds == null || technicianIds.isEmpty()) {
            return null;
        }

        List<TicketStatus> activeStatuses = List.of(TicketStatus.OPEN, TicketStatus.IN_PROGRESS);

        return technicianIds.stream()
                .min(Comparator
                        .comparingLong((Long technicianId) ->
                                ticketRepository.countByAssignedToAndStatusIn(technicianId, activeStatuses))
                        .thenComparingLong(Long::longValue))
                .orElse(null);
    }

    private RoleType resolveRoleForStatusChange(Ticket ticket, Long performedBy, TicketStatusUpdateRequest request) {
        if (request.getStatus() == TicketStatus.CLOSED || request.getStatus() == TicketStatus.REJECTED) {
            return RoleType.ADMIN;
        }

        if (ticket.getAssignedTo() != null && ticket.getAssignedTo().equals(performedBy)) {
            return RoleType.TECHNICIAN;
        }

        if (request.getAssignedTo() != null) {
            return RoleType.ADMIN;
        }

        return RoleType.TECHNICIAN;
    }

    private TicketResponse toResponse(Ticket ticket) {
        TicketResponse r = new TicketResponse();

        r.setId(ticket.getId());
        r.setTitle(ticket.getTitle());
        r.setDescription(ticket.getDescription());
        r.setResourceId(ticket.getResourceId());
        r.setRequiredSkillId(ticket.getRequiredSkillId());
        r.setPriority(ticket.getPriority());
        r.setStatus(ticket.getStatus());
        r.setReportedBy(ticket.getReportedBy());
        r.setAssignedTo(ticket.getAssignedTo());
        r.setResolutionNotes(ticket.getResolutionNotes());
        r.setRejectedReason(ticket.getRejectedReason());

        r.setCreatedAt(ticket.getCreatedAt());
        r.setUpdatedAt(ticket.getUpdatedAt());
        r.setFirstResponseAt(ticket.getFirstResponseAt());
        r.setFirstRespondedBy(ticket.getFirstRespondedBy());
        r.setDueAt(ticket.getDueAt());
        r.setResolvedAt(ticket.getResolvedAt());
        r.setClosedAt(ticket.getClosedAt());

        long count = commentRepository.countByTicketId(ticket.getId());
        r.setCommentCount((int) count);

        List<TicketAttachmentResponse> attachments =
                attachmentRepository.findByTicketId(ticket.getId())
                        .stream()
                        .map(a -> {
                            TicketAttachmentResponse ar = new TicketAttachmentResponse();
                            ar.setId(a.getId());
                            ar.setTicketId(a.getTicketId());
                            ar.setFileUrl(a.getFileUrl());
                            ar.setUploadedBy(a.getUploadedBy());
                            ar.setCreatedAt(a.getCreatedAt());
                            return ar;
                        })
                        .collect(Collectors.toList());

        r.setAttachments(attachments);
        return r;
    }
}