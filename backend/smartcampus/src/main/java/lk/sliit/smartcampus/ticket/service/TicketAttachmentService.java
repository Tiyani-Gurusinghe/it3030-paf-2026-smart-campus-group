package lk.sliit.smartcampus.ticket.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lk.sliit.smartcampus.exception.ResourceNotFoundException;
import lk.sliit.smartcampus.ticket.entity.Ticket;
import lk.sliit.smartcampus.ticket.repository.TicketRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class TicketAttachmentService {

    private final TicketRepository ticketRepository;
    private final TicketValidationService validationService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${app.uploads.dir:uploads}")
    private String uploadsDir;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    public TicketAttachmentService(
            TicketRepository ticketRepository,
            TicketValidationService validationService) {
        this.ticketRepository = ticketRepository;
        this.validationService = validationService;
    }

    public List<String> upload(Long ticketId, List<MultipartFile> files) {
        Ticket ticket = find(ticketId);

        validationService.validateFiles(files);

        List<String> urls = readUrls(ticket);

        for (MultipartFile file : files) {
            if (file.isEmpty()) continue;

            try {
                Path dir = Paths.get(uploadsDir, "tickets", ticketId.toString());
                Files.createDirectories(dir);

                String ext = ext(file.getOriginalFilename());
                String name = UUID.randomUUID() + ext;

                Path path = dir.resolve(name);
                file.transferTo(path);

                urls.add(baseUrl + "/uploads/tickets/" + ticketId + "/" + name);

            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        }

        ticket.setAttachmentUrls(writeUrls(urls));
        ticketRepository.save(ticket);

        return urls;
    }

    public List<String> get(Long ticketId) {
        return readUrls(find(ticketId));
    }

    public void delete(Long ticketId, String url) {
        Ticket ticket = find(ticketId);

        List<String> urls = readUrls(ticket);
        urls.remove(url);

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

    private String ext(String name) {
        if (name == null || !name.contains(".")) return ".jpg";
        return name.substring(name.lastIndexOf('.'));
    }
}