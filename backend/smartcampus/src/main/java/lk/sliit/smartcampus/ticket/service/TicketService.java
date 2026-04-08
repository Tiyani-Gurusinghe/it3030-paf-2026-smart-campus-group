package lk.sliit.smartcampus.ticket.service;

import lk.sliit.smartcampus.exception.ResourceNotFoundException;
import lk.sliit.smartcampus.notification.entity.NotificationType;
import lk.sliit.smartcampus.notification.service.NotificationService;
import lk.sliit.smartcampus.ticket.dto.TicketAttachmentResponse;
import lk.sliit.smartcampus.ticket.dto.TicketRequest;
import lk.sliit.smartcampus.ticket.dto.TicketResponse;
import lk.sliit.smartcampus.ticket.dto.TicketStatusUpdateRequest;
import lk.sliit.smartcampus.ticket.entity.Ticket;
import lk.sliit.smartcampus.ticket.entity.TicketPriority;
import lk.sliit.smartcampus.ticket.entity.TicketStatus;
import lk.sliit.smartcampus.ticket.repository.TicketAttachmentRepository;
import lk.sliit.smartcampus.ticket.repository.TicketCommentRepository;
import lk.sliit.smartcampus.ticket.repository.TicketRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;
    private final TicketCommentRepository commentRepository;
    private final TicketAttachmentRepository attachmentRepository;
    private final NotificationService notificationService;

    public TicketService(TicketRepository ticketRepository,
                         TicketCommentRepository commentRepository,
                         TicketAttachmentRepository attachmentRepository,
                         NotificationService notificationService) {
        this.ticketRepository = ticketRepository;
        this.commentRepository = commentRepository;
        this.attachmentRepository = attachmentRepository;
        this.notificationService = notificationService;
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

    public TicketResponse createTicket(TicketRequest request) {
        Ticket ticket = new Ticket();
        applyRequest(ticket, request);
        ticket.setStatus(TicketStatus.OPEN);
        ticket.setDueAt(calculateDueDate(request.getPriority()));
        return toResponse(ticketRepository.save(ticket));
    }

    public TicketResponse updateTicket(Long id, TicketRequest request) {
        Ticket ticket = findByIdOrThrow(id);
        applyRequest(ticket, request);
        return toResponse(ticketRepository.save(ticket));
    }

    public TicketResponse updateTicketStatus(Long id, Long performedBy, TicketStatusUpdateRequest request) {
        Ticket ticket = findByIdOrThrow(id);

        TicketStatus oldStatus = ticket.getStatus();
        ticket.setStatus(request.getStatus());

        if (request.getAssignedTo() != null) {
            ticket.setAssignedTo(request.getAssignedTo());
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

    private void applyRequest(Ticket ticket, TicketRequest request) {
        ticket.setTitle(request.getTitle());
        ticket.setDescription(request.getDescription());
        ticket.setResourceId(request.getResourceId());
        ticket.setRequiredSkillId(request.getRequiredSkillId());
        ticket.setPriority(request.getPriority());
        ticket.setReportedBy(request.getReportedBy());
    }

    private LocalDateTime calculateDueDate(TicketPriority priority) {
        LocalDateTime now = LocalDateTime.now();
        return switch (priority) {
            case HIGH -> now.plusHours(4);
            case MEDIUM -> now.plusDays(1);
            case LOW -> now.plusDays(3);
        };
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