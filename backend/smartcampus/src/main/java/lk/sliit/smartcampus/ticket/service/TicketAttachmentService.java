package lk.sliit.smartcampus.ticket.service;

import lk.sliit.smartcampus.exception.BadRequestException;
import lk.sliit.smartcampus.exception.ResourceNotFoundException;
import lk.sliit.smartcampus.ticket.dto.TicketAttachmentResponse;
import lk.sliit.smartcampus.ticket.entity.TicketAttachment;
import lk.sliit.smartcampus.ticket.repository.TicketAttachmentRepository;
import lk.sliit.smartcampus.ticket.repository.TicketRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class TicketAttachmentService {

    private final TicketAttachmentRepository attachmentRepository;
    private final TicketRepository ticketRepository;

    @Value("${app.uploads.dir:uploads}")
    private String uploadsDir;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    public TicketAttachmentService(TicketAttachmentRepository attachmentRepository,
                                   TicketRepository ticketRepository) {
        this.attachmentRepository = attachmentRepository;
        this.ticketRepository = ticketRepository;
    }

    public List<TicketAttachmentResponse> uploadAttachments(Long ticketId,
                                                            Long uploadedBy,
                                                            List<MultipartFile> files) {
        ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + ticketId));

        if (files == null || files.isEmpty()) {
            throw new BadRequestException("No files provided");
        }

        long existing = attachmentRepository.countByTicketId(ticketId);
        if (existing + files.size() > 3) {
            throw new BadRequestException("A ticket can have at most 3 attachments");
        }

        List<TicketAttachmentResponse> results = new ArrayList<>();

        for (MultipartFile file : files) {
            if (file.isEmpty()) {
                continue;
            }

            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                throw new BadRequestException("Only image files are allowed. Got: " + contentType);
            }

            try {
                Path dir = Paths.get(uploadsDir, "tickets", String.valueOf(ticketId));
                Files.createDirectories(dir);

                String ext = getExtension(file.getOriginalFilename());
                String storedName = UUID.randomUUID() + ext;
                Path dest = dir.resolve(storedName);
                file.transferTo(dest);

                TicketAttachment attachment = new TicketAttachment();
                attachment.setTicketId(ticketId);
                attachment.setUploadedBy(uploadedBy);
                attachment.setFileUrl(baseUrl + "/uploads/tickets/" + ticketId + "/" + storedName);

                TicketAttachment saved = attachmentRepository.save(attachment);
                results.add(toResponse(saved));

            } catch (IOException e) {
                throw new RuntimeException("Failed to store file: " + e.getMessage(), e);
            }
        }

        return results;
    }

    public List<TicketAttachmentResponse> getAttachments(Long ticketId) {
        ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + ticketId));

        return attachmentRepository.findByTicketId(ticketId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public void deleteAttachment(Long ticketId, Long attachmentId) {
        TicketAttachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Attachment not found: " + attachmentId));

        if (!attachment.getTicketId().equals(ticketId)) {
            throw new ResourceNotFoundException("Attachment does not belong to this ticket");
        }

        try {
            String prefix = baseUrl + "/";
            String relativePath = attachment.getFileUrl().startsWith(prefix)
                    ? attachment.getFileUrl().substring(prefix.length())
                    : attachment.getFileUrl();

            Path filePath = Paths.get(relativePath);
            Files.deleteIfExists(filePath);
        } catch (IOException ignored) {
        }

        attachmentRepository.delete(attachment);
    }

    private TicketAttachmentResponse toResponse(TicketAttachment a) {
        TicketAttachmentResponse r = new TicketAttachmentResponse();
        r.setId(a.getId());
        r.setTicketId(a.getTicketId());
        r.setFileUrl(a.getFileUrl());
        r.setUploadedBy(a.getUploadedBy());
        r.setCreatedAt(a.getCreatedAt());
        return r;
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return ".jpg";
        }
        return filename.substring(filename.lastIndexOf('.'));
    }
}