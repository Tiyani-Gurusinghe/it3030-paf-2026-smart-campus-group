package lk.sliit.smartcampus.config;

import lk.sliit.smartcampus.common.enums.RoleType;
import lk.sliit.smartcampus.ticket.entity.Ticket;
import lk.sliit.smartcampus.ticket.entity.TicketCategory;
import lk.sliit.smartcampus.ticket.entity.TicketPriority;
import lk.sliit.smartcampus.ticket.entity.TicketStatus;
import lk.sliit.smartcampus.ticket.repository.TicketRepository;
import lk.sliit.smartcampus.user.entity.User;
import lk.sliit.smartcampus.user.repository.UserRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class DataInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final TicketRepository ticketRepository;

    public DataInitializer(UserRepository userRepository, TicketRepository ticketRepository) {
        this.userRepository = userRepository;
        this.ticketRepository = ticketRepository;
    }

    @Override
    public void run(ApplicationArguments args) {
        seedUsers();
        seedTickets();
    }

    private void seedUsers() {
        upsertUser("u1", "Normal User",  "user@test.com",  RoleType.STUDENT);
        upsertUser("u2", "Admin User",   "admin@test.com", RoleType.ADMIN);
        upsertUser("u3", "Tech Staff",   "tech@test.com",  RoleType.STAFF);
    }

    private void upsertUser(String oauthId, String fullName, String email, RoleType role) {
        if (userRepository.findByEmailIgnoreCase(email).isEmpty()) {
            User user = new User();
            user.setOauthProvider("local");
            user.setOauthId(oauthId);
            user.setFullName(fullName);
            user.setEmail(email);
            user.setRole(role);
            userRepository.save(user);
            System.out.println("[DataInitializer] Created user: " + email + " (" + role + ")");
        }
    }

    private void seedTickets() {
        if (ticketRepository.count() > 0) return;

        Long studentId = userRepository.findByEmailIgnoreCase("user@test.com").map(User::getId).orElse(1L);
        Long adminId   = userRepository.findByEmailIgnoreCase("admin@test.com").map(User::getId).orElse(2L);

        saveTicket("Projector not working", "Block A Room 101",
                TicketCategory.PROJECTOR,
                "The projector fails to connect via HDMI. Tried multiple cables with no luck.",
                TicketPriority.HIGH, "user@test.com", TicketStatus.OPEN,
                null, null, studentId, LocalDateTime.now().minusDays(0));

        saveTicket("WiFi outage on 2nd Floor", "Library 2nd Floor",
                TicketCategory.NETWORK,
                "Complete WiFi outage on the library second floor since 9am.",
                TicketPriority.HIGH, "user@test.com", TicketStatus.IN_PROGRESS,
                "Tech Staff", null, studentId, LocalDateTime.now().minusDays(1));

        saveTicket("Broken chairs in lecture hall", "Block B Room 204",
                TicketCategory.FURNITURE,
                "Several chairs are broken. Creating a safety hazard.",
                TicketPriority.LOW, "user@test.com", TicketStatus.RESOLVED,
                "Tech Staff", "Chairs replaced from storage room.", studentId, LocalDateTime.now().minusDays(3));

        saveTicket("AC not cooling in staff room", "Staff Room 3",
                TicketCategory.ELECTRICAL,
                "The AC unit is running but not producing cool air.",
                TicketPriority.MEDIUM, "admin@test.com", TicketStatus.OPEN,
                null, null, adminId, LocalDateTime.now().minusDays(2));

        saveTicket("Cleaning required urgently", "Canteen",
                TicketCategory.CLEANING,
                "Large spillage near canteen entrance. Slip hazard for students.",
                TicketPriority.HIGH, "admin@test.com", TicketStatus.CLOSED,
                "Tech Staff", "Area cleaned and wet floor signs placed.", adminId, LocalDateTime.now().minusDays(5));

        System.out.println("[DataInitializer] Seeded 5 dummy tickets.");
    }

    private void saveTicket(String title, String location, TicketCategory category,
                             String description, TicketPriority priority, String contact,
                             TicketStatus status, String assignedTo, String notes,
                             Long reportedBy, LocalDateTime createdAt) {
        Ticket t = new Ticket();
        t.setTitle(title);
        t.setLocation(location);
        t.setCategory(category);
        t.setDescription(description);
        t.setPriority(priority);
        t.setPreferredContact(contact);
        t.setStatus(status);
        t.setAssignedTo(assignedTo);
        t.setResolutionNotes(notes);
        t.setReportedBy(reportedBy);
        t.setCreatedAt(createdAt);
        ticketRepository.save(t);
    }
}
