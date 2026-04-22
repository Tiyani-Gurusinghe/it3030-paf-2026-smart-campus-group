package lk.sliit.smartcampus.ticket.service;

import lk.sliit.smartcampus.common.enums.RoleType;
import lk.sliit.smartcampus.exception.BadRequestException;
import lk.sliit.smartcampus.exception.ResourceNotFoundException;
import lk.sliit.smartcampus.exception.UnauthorizedException;
import lk.sliit.smartcampus.notification.entity.NotificationType;
import lk.sliit.smartcampus.notification.service.NotificationService;
import lk.sliit.smartcampus.ticket.dto.TicketAssignRequest;
import lk.sliit.smartcampus.ticket.dto.TicketRejectRequest;
import lk.sliit.smartcampus.ticket.dto.TicketRequest;
import lk.sliit.smartcampus.ticket.dto.TicketResponse;
import lk.sliit.smartcampus.ticket.dto.TicketStatusUpdateRequest;
import lk.sliit.smartcampus.ticket.entity.Ticket;
import lk.sliit.smartcampus.ticket.entity.TicketPriority;
import lk.sliit.smartcampus.ticket.entity.TicketStatus;
import lk.sliit.smartcampus.ticket.repository.TechnicianSkillRepository;
import lk.sliit.smartcampus.ticket.repository.TicketRepository;
import lk.sliit.smartcampus.user.entity.User;
import lk.sliit.smartcampus.user.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;
    private final TechnicianSkillRepository technicianSkillRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final TicketValidationService ticketValidationService;

    public TicketService(TicketRepository ticketRepository,
                         TechnicianSkillRepository technicianSkillRepository,
                         UserRepository userRepository,
                         NotificationService notificationService,
                         TicketValidationService ticketValidationService) {
        this.ticketRepository = ticketRepository;
        this.technicianSkillRepository = technicianSkillRepository;
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

    @Transactional
    public TicketResponse createTicket(Long currentUserId, TicketRequest request) {
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
        ticket.setDueAt(calculateDueDate(request.getPriority()));
        ticket.setAttachmentUrls("[]");

        Long assignedTechnicianId = findLeastBusyTechnician(request.getRequiredSkillId());
        if (assignedTechnicianId != null) {
            ticket.setAssignedTo(assignedTechnicianId);
        }

        Ticket saved = ticketRepository.save(ticket);

        if (assignedTechnicianId != null) {
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

        if (nextStatus == TicketStatus.CLOSED) {
            ticket.setClosedAt(LocalDateTime.now());
        }

        Ticket saved = ticketRepository.save(ticket);

        if (currentStatus != nextStatus) {
            notificationService.createNotification(
                    ticket.getReportedBy(),
                    NotificationType.TICKET_STATUS_CHANGED,
                    "Ticket \"" + ticket.getTitle() + "\" changed to " + nextStatus,
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

    public void deleteTicket(Long id) {
        ticketRepository.delete(findByIdOrThrow(id));
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

        if (current == TicketStatus.IN_PROGRESS && next == TicketStatus.RESOLVED) {
            if (!isAdmin && !isAssignedTechnician) {
                throw new UnauthorizedException("Only assigned technician or admin can move IN_PROGRESS to RESOLVED");
            }
            return;
        }

        if (current == TicketStatus.RESOLVED && next == TicketStatus.CLOSED) {
            if (!isAdmin) {
                throw new UnauthorizedException("Only admin can move RESOLVED to CLOSED");
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
        r.setAssignedTo(ticket.getAssignedTo());
        r.setPreferredContact(ticket.getPreferredContact());

        r.setCreatedAt(ticket.getCreatedAt());
        r.setUpdatedAt(ticket.getUpdatedAt());
        r.setDueAt(ticket.getDueAt());
        r.setClosedAt(ticket.getClosedAt());

        r.setCommentCount(0);
        r.setAttachments(Collections.emptyList());

        return r;
    }
}