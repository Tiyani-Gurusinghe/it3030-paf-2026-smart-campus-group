package lk.sliit.smartcampus.ticket.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lk.sliit.smartcampus.exception.BadRequestException;
import lk.sliit.smartcampus.exception.ResourceNotFoundException;
import lk.sliit.smartcampus.ticket.entity.Ticket;
import lk.sliit.smartcampus.ticket.repository.TicketRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

@Service
public class TicketAttachmentService {

    private static final Map<String, String> CONTENT_TYPE_EXTENSIONS = Map.of(
            "image/jpeg", ".jpg",
            "image/png", ".png",
            "image/gif", ".gif",
            "image/webp", ".webp"
    );

    private final TicketRepository ticketRepository;
    private final TicketValidationService validationService;
    private final TicketService ticketService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${app.uploads.dir:uploads}")
    private String uploadsDir;

    @Value("${app.base-url:http://localhost:8081}")
    private String baseUrl;

    public TicketAttachmentService(
            TicketRepository ticketRepository,
            TicketValidationService validationService,
            TicketService ticketService) {
        this.ticketRepository = ticketRepository;
        this.validationService = validationService;
        this.ticketService = ticketService;
    }

    public List<String> upload(Long ticketId, Long currentUserId, List<MultipartFile> files) {
        Ticket ticket = find(ticketId);
        ticketService.validateAttachmentModificationPermission(ticket, currentUserId);

        validationService.validateFiles(files);

        List<String> urls = readUrls(ticket);
        validationService.validateCumulativeFileLimit(urls.size(), files);
        Path baseDir = Paths.get(uploadsDir).toAbsolutePath().normalize();
        Path ticketDir = baseDir.resolve(Paths.get("tickets", ticketId.toString())).normalize();

        for (MultipartFile file : files) {
            if (file.isEmpty()) {
                continue;
            }

            try {
                Files.createDirectories(ticketDir);

                String ext = extensionFor(file);
                String name = UUID.randomUUID() + ext;
                Path path = ticketDir.resolve(name).normalize();

                if (!path.startsWith(ticketDir)) {
                    throw new BadRequestException("Invalid file path");
                }

                Files.copy(file.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);
                urls.add(baseUrl + "/uploads/tickets/" + ticketId + "/" + name);
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        }

        ticket.setAttachmentUrls(writeUrls(urls));
        ticketRepository.save(ticket);

        return urls;
    }

    public List<String> get(Long ticketId, Long currentUserId) {
        Ticket ticket = find(ticketId);
        ticketService.validateTicketVisibility(ticket, currentUserId);
        return readUrls(ticket);
    }

    public void delete(Long ticketId, Long currentUserId, String url) {
        Ticket ticket = find(ticketId);
        ticketService.validateAttachmentModificationPermission(ticket, currentUserId);

        List<String> urls = readUrls(ticket);
        boolean removed = urls.remove(url);
        if (!removed) {
            return;
        }

        deletePhysicalFile(ticketId, url);

        ticket.setAttachmentUrls(writeUrls(urls));
        ticketRepository.save(ticket);
    }

    private Ticket find(Long id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));
    }

    private List<String> readUrls(Ticket ticket) {
        try {
            String json = ticket.getAttachmentUrls();
            if (json == null || json.isBlank()) return new ArrayList<>();

            return objectMapper.readValue(
                    json,
                    new TypeReference<List<String>>() {}
            );
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    private String writeUrls(List<String> urls) {
        try {
            return objectMapper.writeValueAsString(urls);
        } catch (Exception e) {
            return "[]";
        }
    }

    private String extensionFor(MultipartFile file) {
        String contentType = file.getContentType() == null
                ? ""
                : file.getContentType().toLowerCase(Locale.ROOT).trim();
        return CONTENT_TYPE_EXTENSIONS.getOrDefault(contentType, ".jpg");
    }

    private void deletePhysicalFile(Long ticketId, String url) {
        String filename = extractFileName(url);
        if (filename.isBlank()) {
            return;
        }

        Path ticketDir = Paths.get(uploadsDir, "tickets", ticketId.toString())
                .toAbsolutePath()
                .normalize();
        Path target = ticketDir.resolve(filename).normalize();
        if (!target.startsWith(ticketDir)) {
            throw new BadRequestException("Invalid attachment path");
        }

        try {
            Files.deleteIfExists(target);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    private String extractFileName(String url) {
        String pathValue = url;
        try {
            URI uri = new URI(url);
            if (uri.getPath() != null) {
                pathValue = uri.getPath();
            }
        } catch (URISyntaxException ignored) {
            // Keep original value for plain relative paths.
        }

        Path path = Paths.get(pathValue).getFileName();
        return path == null ? "" : path.toString();
    }
}
