package lk.sliit.smartcampus.ticket.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lk.sliit.smartcampus.common.enums.RoleType;
import lk.sliit.smartcampus.exception.BadRequestException;
import lk.sliit.smartcampus.exception.ResourceNotFoundException;
import lk.sliit.smartcampus.exception.UnauthorizedException;
import lk.sliit.smartcampus.notification.entity.NotificationType;
import lk.sliit.smartcampus.notification.service.NotificationService;
import lk.sliit.smartcampus.resource.entity.Resource;
import lk.sliit.smartcampus.resource.repository.ResourceRepository;
import lk.sliit.smartcampus.ticket.dto.TicketAssignRequest;
import lk.sliit.smartcampus.ticket.dto.TicketRejectRequest;
import lk.sliit.smartcampus.ticket.dto.SkillOptionResponse;
import lk.sliit.smartcampus.ticket.dto.TechnicianOptionResponse;
import lk.sliit.smartcampus.ticket.dto.TicketDueDateUpdateRequest;
import lk.sliit.smartcampus.ticket.dto.TicketRequest;
import lk.sliit.smartcampus.ticket.dto.TicketResponse;
import lk.sliit.smartcampus.ticket.dto.TicketResolutionUpdateRequest;
import lk.sliit.smartcampus.ticket.dto.TicketStatusUpdateRequest;
import lk.sliit.smartcampus.ticket.entity.Ticket;
import lk.sliit.smartcampus.ticket.entity.TicketPriority;
import lk.sliit.smartcampus.ticket.entity.TicketStatus;
import lk.sliit.smartcampus.ticket.repository.ResourceTypeSkillRepository;
import lk.sliit.smartcampus.ticket.repository.TechnicianSkillRepository;
import lk.sliit.smartcampus.ticket.repository.TicketRepository;
import lk.sliit.smartcampus.user.entity.User;
import lk.sliit.smartcampus.user.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;
    private final TechnicianSkillRepository technicianSkillRepository;
    private final ResourceTypeSkillRepository resourceTypeSkillRepository;
    private final ResourceRepository resourceRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final TicketValidationService ticketValidationService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public TicketService(TicketRepository ticketRepository,
                         TechnicianSkillRepository technicianSkillRepository,
                         ResourceTypeSkillRepository resourceTypeSkillRepository,
                         ResourceRepository resourceRepository,
                         UserRepository userRepository,
                         NotificationService notificationService,
                         TicketValidationService ticketValidationService) {
        this.ticketRepository = ticketRepository;
        this.technicianSkillRepository = technicianSkillRepository;
        this.resourceTypeSkillRepository = resourceTypeSkillRepository;
        this.resourceRepository = resourceRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.ticketValidationService = ticketValidationService;
    }

    private List<TicketResponse> mapPage(Page<Ticket> page) {
        return page.getContent().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public boolean isAdmin(Long userId) {
        return findUserByIdOrThrow(userId).hasRole(RoleType.ADMIN);
    }

    public boolean isTechnician(Long userId) {
        return findUserByIdOrThrow(userId).hasRole(RoleType.TECHNICIAN);
    }

    public List<TicketResponse> getAllTickets(Long currentUserId,
                                              TicketStatus status,
                                              TicketPriority priority,
                                              Long reportedBy,
                                              int page,
                                              int size) {
        User user = findUserByIdOrThrow(currentUserId);

        if (!user.hasRole(RoleType.ADMIN)) {
            throw new UnauthorizedException("Only admin can view all tickets");
        }

        Pageable pageable = PageRequest.of(page, size);
        return mapPage(ticketRepository.findWithFilters(status, priority, reportedBy, pageable));
    }

    public List<TicketResponse> getMyVisibleTickets(Long currentUserId, int page, int size) {
        User user = findUserByIdOrThrow(currentUserId);
        Pageable pageable = PageRequest.of(page, size);

        if (user.hasRole(RoleType.ADMIN)) {
            return mapPage(ticketRepository.findAll(pageable));
        }

        if (user.hasRole(RoleType.TECHNICIAN)) {
            return mapPage(ticketRepository.findByAssignedTo(currentUserId, pageable));
        }

        return mapPage(ticketRepository.findByReportedBy(currentUserId, pageable));
    }

    public List<SkillOptionResponse> getSkillsForResource(Long resourceId) {
        Resource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found: " + resourceId));

        return resourceTypeSkillRepository.findSkillOptionsByResourceType(resource.getType().name())
                .stream()
                .map(row -> new SkillOptionResponse(row.getId(), row.getName()))
                .collect(Collectors.toList());
    }

    public List<TechnicianOptionResponse> getAssignableTechnicians(Long ticketId, Long currentUserId) {
        User currentUser = findUserByIdOrThrow(currentUserId);
        if (!currentUser.hasRole(RoleType.ADMIN)) {
            throw new UnauthorizedException("Only admin can view assignable technicians");
        }

        Ticket ticket = findByIdOrThrow(ticketId);
        List<Long> technicianIds = technicianSkillRepository.findTechnicianIdsBySkillId(ticket.getRequiredSkillId());
        if (technicianIds == null || technicianIds.isEmpty()) {
            return Collections.emptyList();
        }

        return userRepository.findAllById(technicianIds).stream()
                .map(user -> new TechnicianOptionResponse(user.getId(), user.getFullName(), user.getEmail()))
                .sorted(Comparator.comparing(
                        item -> item.getFullName() == null ? "" : item.getFullName(),
                        String.CASE_INSENSITIVE_ORDER))
                .collect(Collectors.toList());
    }

    public List<TicketResponse> getTechnicianTickets(Long technicianUserId,
                                                     TicketStatus status,
                                                     boolean overdue,
                                                     boolean dueSoon,
                                                     int page,
                                                     int size) {
        User user = findUserByIdOrThrow(technicianUserId);

        if (!user.hasRole(RoleType.TECHNICIAN)) {
            throw new UnauthorizedException("Only technicians can access technician tickets");
        }

        Pageable pageable = PageRequest.of(page, size);
        List<Ticket> tickets = ticketRepository.findByAssignedTo(technicianUserId, pageable).getContent();

        if (status != null) {
            tickets = tickets.stream()
                    .filter(ticket -> ticket.getStatus() == status)
                    .collect(Collectors.toList());
        }

        LocalDateTime now = LocalDateTime.now();

        if (overdue) {
            tickets = tickets.stream()
                    .filter(ticket ->
                            ticket.getDueAt() != null &&
                            ticket.getDueAt().isBefore(now) &&
                            (ticket.getStatus() == TicketStatus.OPEN || ticket.getStatus() == TicketStatus.IN_PROGRESS))
                    .collect(Collectors.toList());
        }

        if (dueSoon) {
            LocalDateTime dueSoonLimit = now.plusHours(24);
            tickets = tickets.stream()
                    .filter(ticket ->
                            ticket.getDueAt() != null &&
                            !ticket.getDueAt().isBefore(now) &&
                            !ticket.getDueAt().isAfter(dueSoonLimit) &&
                            (ticket.getStatus() == TicketStatus.OPEN || ticket.getStatus() == TicketStatus.IN_PROGRESS))
                    .collect(Collectors.toList());
        }

        return tickets.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public TicketResponse getTicketByIdVisibleToUser(Long ticketId, Long currentUserId) {
        Ticket ticket = findByIdOrThrow(ticketId);
        validateTicketVisibility(ticket, currentUserId);
        return toResponse(ticket);
    }

    public void validateTicketVisibility(Ticket ticket, Long currentUserId) {
        User user = findUserByIdOrThrow(currentUserId);

        if (user.hasRole(RoleType.ADMIN)) {
            return;
        }

        if (user.hasRole(RoleType.TECHNICIAN)
                && ticket.getAssignedTo() != null
                && ticket.getAssignedTo().equals(currentUserId)) {
            return;
        }

        if (ticket.getReportedBy().equals(currentUserId)) {
            return;
        }

        throw new UnauthorizedException("You do not have permission to access this ticket");
    }

    public void validateTicketModificationPermission(Ticket ticket, Long currentUserId) {
        User user = findUserByIdOrThrow(currentUserId);

        if (user.hasRole(RoleType.ADMIN)) {
            return;
        }

        boolean isReporter = ticket.getReportedBy() != null && ticket.getReportedBy().equals(currentUserId);
        if (!isReporter) {
            throw new UnauthorizedException("Only the reporter or admin can modify this ticket");
        }

        if (ticket.getStatus() != TicketStatus.OPEN) {
            throw new BadRequestException("Reporter can only modify OPEN tickets");
        }
    }

    public void validateAttachmentModificationPermission(Ticket ticket, Long currentUserId) {
        User user = findUserByIdOrThrow(currentUserId);

        if (user.hasRole(RoleType.ADMIN)) {
            return;
        }

        boolean isReporter = ticket.getReportedBy() != null && ticket.getReportedBy().equals(currentUserId);
        boolean isAssignedTechnician = user.hasRole(RoleType.TECHNICIAN)
                && ticket.getAssignedTo() != null
                && ticket.getAssignedTo().equals(currentUserId);

        if (!isReporter && !isAssignedTechnician) {
            throw new UnauthorizedException("Only reporter, assigned technician, or admin can modify attachments");
        }

        if (ticket.getStatus() == TicketStatus.CLOSED || ticket.getStatus() == TicketStatus.REJECTED) {
            throw new BadRequestException("Attachments cannot be modified for CLOSED or REJECTED tickets");
        }
    }

    @Transactional
    public void markFirstResponseIfApplicable(Ticket ticket, Long actorUserId) {
        if (ticket.getFirstRespondedAt() != null || actorUserId == null) {
            return;
        }

        User actor = findUserByIdOrThrow(actorUserId);
        if (actor.hasRole(RoleType.ADMIN) || actor.hasRole(RoleType.TECHNICIAN)) {
            ticket.setFirstRespondedAt(LocalDateTime.now());
            ticketRepository.save(ticket);
        }
    }

    @Transactional
    public TicketResponse createTicket(Long currentUserId, TicketRequest request) {
        findUserByIdOrThrow(currentUserId);
        ticketValidationService.validateCreateRequest(request);

        Ticket ticket = new Ticket();
        ticket.setTitle(request.getTitle());
        ticket.setLocation(request.getLocation());
        ticket.setCategory(request.getCategory());
        ticket.setDescription(request.getDescription());
        ticket.setResourceId(request.getResourceId());
        ticket.setRequiredSkillId(request.getRequiredSkillId());
        ticket.setPriority(request.getPriority());
        ticket.setPreferredContact(request.getPreferredContact());
        ticket.setReportedBy(currentUserId);
        ticket.setStatus(TicketStatus.OPEN);
        LocalDateTime dueAt = calculateDueDate(request.getPriority());
        ticket.setDueAt(dueAt);
        ticket.setOriginalDueAt(dueAt);
        ticket.setAttachmentUrls("[]");

        Long assignedTechnicianId = findLeastBusyTechnician(request.getRequiredSkillId());
        if (assignedTechnicianId != null) {
            ticket.setAssignedTo(assignedTechnicianId);
            ticket.setFirstRespondedAt(LocalDateTime.now());
        }

        Ticket saved = ticketRepository.save(ticket);

        if (assignedTechnicianId != null) {
            notificationService.createNotification(
                    assignedTechnicianId,
                    NotificationType.TICKET_ASSIGNED,
                    "New ticket assigned",
                    "Ticket \"" + saved.getTitle() + "\" has been assigned to you.",
                    saved.getId()
            );
        }

        return toResponse(saved);
    }

    public TicketResponse updateTicket(Long id, TicketRequest request, Long currentUserId) {
        Ticket ticket = findByIdOrThrow(id);
        validateTicketModificationPermission(ticket, currentUserId);

        ticketValidationService.validateCreateRequest(request);

        ticket.setTitle(request.getTitle());
        ticket.setLocation(request.getLocation());
        ticket.setCategory(request.getCategory());
        ticket.setDescription(request.getDescription());
        ticket.setResourceId(request.getResourceId());
        ticket.setRequiredSkillId(request.getRequiredSkillId());
        ticket.setPriority(request.getPriority());
        ticket.setPreferredContact(request.getPreferredContact());

        return toResponse(ticketRepository.save(ticket));
    }

    @Transactional
    public TicketResponse assignTicket(Long ticketId, Long currentUserId, TicketAssignRequest request) {
        User currentUser = findUserByIdOrThrow(currentUserId);
        if (!currentUser.hasRole(RoleType.ADMIN)) {
            throw new UnauthorizedException("Only admin can assign or reassign tickets");
        }

        Ticket ticket = findByIdOrThrow(ticketId);

        ticketValidationService.validateTechnicianHasSkill(request.getAssignedTo(), ticket.getRequiredSkillId());

        ticket.setAssignedTo(request.getAssignedTo());
        if (ticket.getFirstRespondedAt() == null) {
            ticket.setFirstRespondedAt(LocalDateTime.now());
        }
        Ticket saved = ticketRepository.save(ticket);

        return toResponse(saved);
    }

    @Transactional
    public TicketResponse updateStatus(Long ticketId,
                                       TicketStatusUpdateRequest request,
                                       Long currentUserId) {
        Ticket ticket = findByIdOrThrow(ticketId);
        User currentUser = findUserByIdOrThrow(currentUserId);

        TicketStatus currentStatus = ticket.getStatus();
        TicketStatus nextStatus = request.getStatus();

        enforceStatusTransition(ticket, currentUser, request);

        if (request.getAssignedTo() != null) {
            ticketValidationService.validateTechnicianHasSkill(request.getAssignedTo(), ticket.getRequiredSkillId());
            ticket.setAssignedTo(request.getAssignedTo());
        }

        ticket.setStatus(nextStatus);

        if (nextStatus == TicketStatus.RESOLVED) {
            String resolutionNotes = request.getResolutionNotes();
            if (resolutionNotes == null || resolutionNotes.isBlank()) {
                throw new BadRequestException("Resolution notes are required when resolving a ticket");
            }
            ticket.setResolutionNotes(resolutionNotes.trim());
            ticket.setResolvedAt(LocalDateTime.now());
            if (ticket.getFirstRespondedAt() == null) {
                ticket.setFirstRespondedAt(LocalDateTime.now());
            }
        }

        if (nextStatus == TicketStatus.REJECTED) {
            ticket.setRejectedReason(request.getRejectedReason().trim());
            if (ticket.getFirstRespondedAt() == null) {
                ticket.setFirstRespondedAt(LocalDateTime.now());
            }
        }

        if (nextStatus == TicketStatus.CLOSED) {
            ticket.setClosedAt(LocalDateTime.now());
        }

        if (currentStatus == TicketStatus.OPEN && nextStatus == TicketStatus.IN_PROGRESS && ticket.getFirstRespondedAt() == null) {
            ticket.setFirstRespondedAt(LocalDateTime.now());
        }

        Ticket saved = ticketRepository.save(ticket);

        if (currentStatus != nextStatus) {
            notificationService.createNotification(
                    ticket.getReportedBy(),
                    NotificationType.TICKET_STATUS_CHANGED,
                    "Ticket status updated",
                    "Your ticket \"" + ticket.getTitle() + "\" status changed to " + nextStatus,
                    ticketId
            );
        }

        return toResponse(saved);
    }

    @Transactional
    public TicketResponse rejectTicket(Long ticketId, Long currentUserId, TicketRejectRequest request) {
        TicketStatusUpdateRequest statusRequest = new TicketStatusUpdateRequest();
        statusRequest.setStatus(TicketStatus.REJECTED);
        statusRequest.setRejectedReason(request.getRejectedReason());
        return updateStatus(ticketId, statusRequest, currentUserId);
    }

    @Transactional
    public TicketResponse closeTicket(Long ticketId, Long currentUserId) {
        TicketStatusUpdateRequest statusRequest = new TicketStatusUpdateRequest();
        statusRequest.setStatus(TicketStatus.CLOSED);
        return updateStatus(ticketId, statusRequest, currentUserId);
    }

    @Transactional
    public TicketResponse updateResolutionNotes(Long ticketId,
                                                TicketResolutionUpdateRequest request,
                                                Long currentUserId) {
        Ticket ticket = findByIdOrThrow(ticketId);
        User currentUser = findUserByIdOrThrow(currentUserId);

        boolean isAdmin = currentUser.hasRole(RoleType.ADMIN);
        boolean isAssignedTechnician = currentUser.hasRole(RoleType.TECHNICIAN)
                && ticket.getAssignedTo() != null
                && ticket.getAssignedTo().equals(currentUser.getId());

        if (!isAdmin && !isAssignedTechnician) {
            throw new UnauthorizedException("Only assigned technician or admin can update resolution notes");
        }

        if (ticket.getStatus() == TicketStatus.CLOSED || ticket.getStatus() == TicketStatus.REJECTED) {
            throw new BadRequestException("Resolution notes cannot be updated for CLOSED or REJECTED tickets");
        }

        ticket.setResolutionNotes(request.getResolutionNotes().trim());
        return toResponse(ticketRepository.save(ticket));
    }

    @Transactional
    public TicketResponse extendDueDate(Long ticketId,
                                        TicketDueDateUpdateRequest request,
                                        Long currentUserId) {
        Ticket ticket = findByIdOrThrow(ticketId);
        User currentUser = findUserByIdOrThrow(currentUserId);

        boolean isAdmin = currentUser.hasRole(RoleType.ADMIN);
        boolean isAssignedTechnician = currentUser.hasRole(RoleType.TECHNICIAN)
                && ticket.getAssignedTo() != null
                && ticket.getAssignedTo().equals(currentUser.getId());

        if (!isAdmin && !isAssignedTechnician) {
            throw new UnauthorizedException("Only admin or assigned technician can extend the due date");
        }

        if (ticket.getStatus() == TicketStatus.RESOLVED
                || ticket.getStatus() == TicketStatus.CLOSED
                || ticket.getStatus() == TicketStatus.REJECTED) {
            throw new BadRequestException("Due date can only be extended for OPEN or IN_PROGRESS tickets");
        }

        LocalDateTime currentDueAt = ticket.getDueAt();
        if (currentDueAt != null && !request.getDueAt().isAfter(currentDueAt)) {
            throw new BadRequestException("New due date must be later than the current due date");
        }

        if (ticket.getOriginalDueAt() == null) {
            ticket.setOriginalDueAt(currentDueAt);
        }
        ticket.setDueAt(request.getDueAt());
        ticket.setDueExtendedAt(LocalDateTime.now());
        ticket.setDueExtendedBy(currentUserId);
        ticket.setDueExtensionNote(request.getNote().trim());

        return toResponse(ticketRepository.save(ticket));
    }

    public void deleteTicket(Long id, Long currentUserId) {
        Ticket ticket = findByIdOrThrow(id);
        validateTicketModificationPermission(ticket, currentUserId);
        ticketRepository.delete(ticket);
    }

    private void enforceStatusTransition(Ticket ticket,
                                         User currentUser,
                                         TicketStatusUpdateRequest request) {
        TicketStatus current = ticket.getStatus();
        TicketStatus next = request.getStatus();

        boolean isAdmin = currentUser.hasRole(RoleType.ADMIN);
        boolean isAssignedTechnician = currentUser.hasRole(RoleType.TECHNICIAN)
                && ticket.getAssignedTo() != null
                && ticket.getAssignedTo().equals(currentUser.getId());
        boolean isReporter = ticket.getReportedBy() != null
                && ticket.getReportedBy().equals(currentUser.getId());

        if (next == null) {
            throw new BadRequestException("Status is required");
        }

        if (current == next) {
            throw new BadRequestException("Ticket is already in status " + next);
        }

        if (current == TicketStatus.OPEN && next == TicketStatus.IN_PROGRESS) {
            if (!isAdmin && !isAssignedTechnician) {
                throw new UnauthorizedException("Only assigned technician or admin can move OPEN to IN_PROGRESS");
            }
            return;
        }

        if ((current == TicketStatus.OPEN || current == TicketStatus.IN_PROGRESS) && next == TicketStatus.RESOLVED) {
            if (!isAdmin && !isAssignedTechnician && !isReporter) {
                throw new UnauthorizedException("Only reporter, assigned technician, or admin can resolve this ticket");
            }
            return;
        }

        if (current == TicketStatus.RESOLVED && next == TicketStatus.CLOSED) {
            if (!isAdmin && !isReporter) {
                throw new UnauthorizedException("Only reporter or admin can close a resolved ticket");
            }
            return;
        }

        if (current == TicketStatus.OPEN && next == TicketStatus.REJECTED) {
            if (!isAdmin) {
                throw new UnauthorizedException("Only admin can reject an OPEN ticket");
            }
            if (request.getRejectedReason() == null || request.getRejectedReason().isBlank()) {
                throw new BadRequestException("Rejected reason is required");
            }
            return;
        }

        if (current == TicketStatus.IN_PROGRESS && next == TicketStatus.REJECTED) {
            if (!isAdmin) {
                throw new UnauthorizedException("Only admin can reject an IN_PROGRESS ticket");
            }
            if (request.getRejectedReason() == null || request.getRejectedReason().isBlank()) {
                throw new BadRequestException("Rejected reason is required");
            }
            return;
        }

        throw new BadRequestException("Invalid status transition: " + current + " -> " + next);
    }

    private Ticket findByIdOrThrow(Long id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + id));
    }

    private User findUserByIdOrThrow(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
    }

    private LocalDateTime calculateDueDate(TicketPriority priority) {
        LocalDateTime now = LocalDateTime.now();
        return switch (priority) {
            case HIGH -> now.plusDays(1);
            case MEDIUM -> now.plusDays(5);
            case LOW -> now.plusDays(14);
        };
    }

    private Long findLeastBusyTechnician(Long requiredSkillId) {
        List<Long> technicianIds = technicianSkillRepository.findTechnicianIdsBySkillId(requiredSkillId);

        if (technicianIds == null || technicianIds.isEmpty()) {
            technicianIds = userRepository.findUserIdsByRoleType(RoleType.TECHNICIAN);
        }

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

    private TicketResponse toResponse(Ticket ticket) {
        TicketResponse r = new TicketResponse();

        r.setId(ticket.getId());
        r.setTitle(ticket.getTitle());
        r.setLocation(ticket.getLocation());
        r.setCategory(ticket.getCategory());
        r.setDescription(ticket.getDescription());

        r.setResourceId(ticket.getResourceId());
        r.setRequiredSkillId(ticket.getRequiredSkillId());
        r.setPriority(ticket.getPriority());
        r.setStatus(ticket.getStatus());
        r.setReportedBy(ticket.getReportedBy());
        r.setReportedByName(resolveUserName(ticket.getReportedBy()));
        r.setAssignedTo(ticket.getAssignedTo());
        r.setAssignedToName(resolveUserName(ticket.getAssignedTo()));
        r.setPreferredContact(ticket.getPreferredContact());

        r.setCreatedAt(ticket.getCreatedAt());
        r.setUpdatedAt(ticket.getUpdatedAt());
        r.setDueAt(ticket.getDueAt());
        r.setOriginalDueAt(ticket.getOriginalDueAt());
        r.setFirstRespondedAt(ticket.getFirstRespondedAt());
        r.setResolvedAt(ticket.getResolvedAt());
        r.setClosedAt(ticket.getClosedAt());
        r.setDueExtendedAt(ticket.getDueExtendedAt());
        r.setDueExtendedBy(ticket.getDueExtendedBy());
        r.setDueExtendedByName(resolveUserName(ticket.getDueExtendedBy()));
        r.setDueExtensionNote(ticket.getDueExtensionNote());
        r.setResolutionNotes(ticket.getResolutionNotes());
        r.setRejectedReason(ticket.getRejectedReason());
        r.setTimeToFirstResponseMinutes(calculateMinutes(ticket.getCreatedAt(), ticket.getFirstRespondedAt()));
        r.setTimeToResolutionMinutes(calculateMinutes(ticket.getCreatedAt(), ticket.getResolvedAt()));

        r.setAttachmentUrls(parseAttachmentUrls(ticket.getAttachmentUrls()));
        r.setCommentCount(0);
        r.setAttachments(Collections.emptyList());

        return r;
    }

    private String resolveUserName(Long userId) {
        if (userId == null) {
            return null;
        }
        return userRepository.findById(userId)
                .map(User::getFullName)
                .orElse(null);
    }

    private Long calculateMinutes(LocalDateTime start, LocalDateTime end) {
        if (start == null || end == null) {
            return null;
        }
        return Duration.between(start, end).toMinutes();
    }

    private List<String> parseAttachmentUrls(String json) {
        try {
            if (json == null || json.isBlank()) {
                return new ArrayList<>();
            }
            return objectMapper.readValue(
                    json,
                    new TypeReference<List<String>>() {}
            );
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }
}
