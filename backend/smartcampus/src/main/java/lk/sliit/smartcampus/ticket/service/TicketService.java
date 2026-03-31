package lk.sliit.smartcampus.ticket.service;

import lk.sliit.smartcampus.exception.ResourceNotFoundException;
import lk.sliit.smartcampus.notification.entity.NotificationType;
import lk.sliit.smartcampus.notification.service.NotificationService;
import lk.sliit.smartcampus.ticket.dto.TicketAttachmentResponse;
import lk.sliit.smartcampus.ticket.dto.TicketRequest;
import lk.sliit.smartcampus.ticket.dto.TicketResponse;
import lk.sliit.smartcampus.ticket.dto.TicketStatusUpdateRequest;
import lk.sliit.smartcampus.ticket.entity.Ticket;
import lk.sliit.smartcampus.ticket.entity.TicketCategory;
import lk.sliit.smartcampus.ticket.entity.TicketPriority;
import lk.sliit.smartcampus.ticket.entity.TicketStatus;
import lk.sliit.smartcampus.ticket.repository.TicketAttachmentRepository;
import lk.sliit.smartcampus.ticket.repository.TicketCommentRepository;
import lk.sliit.smartcampus.ticket.repository.TicketRepository;
import org.springframework.stereotype.Service;

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

    public List<TicketResponse> getAllTickets(TicketStatus status, TicketPriority priority,
                                              TicketCategory category, Long reportedBy) {
        return ticketRepository.findWithFilters(status, priority, category, reportedBy)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public TicketResponse getTicketById(Long id) {
        return toResponse(findByIdOrThrow(id));
    }

    public TicketResponse createTicket(TicketRequest request) {
        Ticket ticket = new Ticket();
        applyRequest(ticket, request);
        ticket.setStatus(TicketStatus.OPEN);
        return toResponse(ticketRepository.save(ticket));
    }

    public TicketResponse updateTicket(Long id, TicketRequest request) {
        Ticket ticket = findByIdOrThrow(id);
        applyRequest(ticket, request);
        return toResponse(ticketRepository.save(ticket));
    }

    public TicketResponse updateTicketStatus(Long id, TicketStatusUpdateRequest request) {
        Ticket ticket = findByIdOrThrow(id);
        TicketStatus oldStatus = ticket.getStatus();
        ticket.setStatus(request.getStatus());
        ticket.setAssignedTo(request.getAssignedTo());
        ticket.setResolutionNotes(request.getResolutionNotes());
        Ticket saved = ticketRepository.save(ticket);

        // Notify reporter of status change
        if (ticket.getReportedBy() != null && !oldStatus.equals(request.getStatus())) {
            notificationService.createNotification(
                    ticket.getReportedBy(),
                    NotificationType.TICKET_STATUS_CHANGED,
                    "Your ticket \"" + ticket.getTitle() + "\" status changed to " + request.getStatus(),
                    id
            );
        }

        // Notify if assigned to someone
        if (request.getAssignedTo() != null && !request.getAssignedTo().isBlank()) {
            if (ticket.getReportedBy() != null) {
                notificationService.createNotification(
                        ticket.getReportedBy(),
                        NotificationType.TICKET_ASSIGNED,
                        "Your ticket \"" + ticket.getTitle() + "\" has been assigned to " + request.getAssignedTo(),
                        id
                );
            }
        }

        return toResponse(saved);
    }

    public void deleteTicket(Long id) {
        Ticket ticket = findByIdOrThrow(id);
        ticketRepository.delete(ticket);
    }

    private Ticket findByIdOrThrow(Long id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + id));
    }

    private void applyRequest(Ticket ticket, TicketRequest request) {
        ticket.setTitle(request.getTitle());
        ticket.setLocation(request.getLocation());
        ticket.setCategory(request.getCategory());
        ticket.setDescription(request.getDescription());
        ticket.setPriority(request.getPriority());
        ticket.setPreferredContact(request.getPreferredContact());
        ticket.setAssignedTo(request.getAssignedTo());
        ticket.setResolutionNotes(request.getResolutionNotes());
        ticket.setReportedBy(request.getReportedBy());
    }

    private TicketResponse toResponse(Ticket ticket) {
        TicketResponse r = new TicketResponse();
        r.setId(ticket.getId());
        r.setTitle(ticket.getTitle());
        r.setLocation(ticket.getLocation());
        r.setCategory(ticket.getCategory());
        r.setDescription(ticket.getDescription());
        r.setPriority(ticket.getPriority());
        r.setPreferredContact(ticket.getPreferredContact());
        r.setStatus(ticket.getStatus());
        r.setAssignedTo(ticket.getAssignedTo());
        r.setResolutionNotes(ticket.getResolutionNotes());
        r.setReportedBy(ticket.getReportedBy());
        r.setCreatedAt(ticket.getCreatedAt());
        r.setUpdatedAt(ticket.getUpdatedAt());

        // Attach comment count
        long count = commentRepository.countByTicketId(ticket.getId());
        r.setCommentCount((int) count);

        // Attach attachments
        List<TicketAttachmentResponse> attachments = attachmentRepository.findByTicketId(ticket.getId())
                .stream().map(a -> {
                    TicketAttachmentResponse ar = new TicketAttachmentResponse();
                    ar.setId(a.getId());
                    ar.setTicketId(a.getTicketId());
                    ar.setFileName(a.getFileName());
                    ar.setFileUrl(a.getFileUrl());
                    ar.setUploadedAt(a.getUploadedAt());
                    return ar;
                }).collect(Collectors.toList());
        r.setAttachments(attachments);

        return r;
    }
}