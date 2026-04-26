package lk.sliit.smartcampus.ticket.integration;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@Testcontainers(disabledWithoutDocker = true)
@SpringBootTest
@AutoConfigureMockMvc
class TicketModuleIntegrationTest {

    @Container
    static final MySQLContainer<?> MYSQL = new MySQLContainer<>("mysql:8.0");

    @DynamicPropertySource
    static void databaseProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", MYSQL::getJdbcUrl);
        registry.add("spring.datasource.username", MYSQL::getUsername);
        registry.add("spring.datasource.password", MYSQL::getPassword);
        registry.add("spring.datasource.driverClassName", MYSQL::getDriverClassName);
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "create-drop");
        registry.add("spring.jpa.database-platform", () -> "org.hibernate.dialect.MySQLDialect");
        registry.add("spring.flyway.enabled", () -> "false");
        registry.add("app.uploads.dir", () -> "target/test-uploads");
        registry.add("app.base-url", () -> "http://localhost:8081");
    }

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS=0");
        jdbcTemplate.execute("TRUNCATE TABLE notification_preferences");
        jdbcTemplate.execute("TRUNCATE TABLE notifications");
        jdbcTemplate.execute("TRUNCATE TABLE ticket_history");
        jdbcTemplate.execute("TRUNCATE TABLE tickets");
        jdbcTemplate.execute("TRUNCATE TABLE technician_skills");
        jdbcTemplate.execute("TRUNCATE TABLE resource_type_skills");
        jdbcTemplate.execute("TRUNCATE TABLE skills");
        jdbcTemplate.execute("TRUNCATE TABLE resource_faculties");
        jdbcTemplate.execute("TRUNCATE TABLE resources");
        jdbcTemplate.execute("TRUNCATE TABLE user_roles");
        jdbcTemplate.execute("TRUNCATE TABLE users");
        jdbcTemplate.execute("TRUNCATE TABLE roles");
        jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS=1");

        jdbcTemplate.update("INSERT INTO roles (id, name) VALUES (1, 'ADMIN'), (2, 'USER'), (3, 'TECHNICIAN')");

        jdbcTemplate.update("""
                INSERT INTO users (id, oauth_provider, oauth_id, full_name, email, created_at)
                VALUES (10, 'google', 'admin-1', 'Admin User', 'admin@test.com', NOW()),
                       (20, 'google', 'user-1', 'Reporter User', 'reporter@test.com', NOW()),
                       (30, 'google', 'tech-1', 'Tech User', 'tech@test.com', NOW()),
                       (40, 'google', 'user-2', 'Other User', 'other@test.com', NOW())
                """);

        jdbcTemplate.update("""
                INSERT INTO user_roles (user_id, role_id)
                VALUES (10, 1), (20, 2), (30, 3), (40, 2)
                """);

        jdbcTemplate.update("INSERT INTO skills (id, name) VALUES (200, 'IT_SUPPORT')");
        jdbcTemplate.update("INSERT INTO technician_skills (user_id, skill_id) VALUES (30, 200)");
        jdbcTemplate.update("INSERT INTO resource_type_skills (resource_type, skill_id) VALUES ('PROJECTOR', 200)");

        jdbcTemplate.update("""
                INSERT INTO resources (
                    id, resource_name, resource_type, resource_category, config_type, floor,
                    capacity, location, status, parent_id, created_at, availability_start, availability_end
                )
                VALUES (100, 'Projector X', 'PROJECTOR', 'EQUIPMENT', 'NONE', NULL,
                        1, 'A401', 'ACTIVE', NULL, NOW(), '08:00:00', '18:00:00')
                """);
    }

    @Test
    void createAssignResolveAndExposeSlaFields() throws Exception {
        long ticketId = createTicket(20L);

        mockMvc.perform(patch("/api/v1/admin/tickets/{id}/assignment", ticketId)
                        .with(admin())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"assignedTo\":30}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.assignedTo").value(30));

        mockMvc.perform(patch("/api/v1/tickets/{id}", ticketId)
                        .with(technician())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"IN_PROGRESS\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("IN_PROGRESS"));

        mockMvc.perform(patch("/api/v1/tickets/{id}", ticketId)
                        .with(technician())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"RESOLVED\",\"resolutionNotes\":\"Cable replaced and tested\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("RESOLVED"))
                .andExpect(jsonPath("$.resolutionNotes").value("Cable replaced and tested"))
                .andExpect(jsonPath("$.resolvedAt", notNullValue()))
                .andExpect(jsonPath("$.firstRespondedAt", notNullValue()))
                .andExpect(jsonPath("$.timeToFirstResponseMinutes", notNullValue()))
                .andExpect(jsonPath("$.timeToResolutionMinutes", notNullValue()));

        mockMvc.perform(patch("/api/v1/tickets/{id}", ticketId)
                        .with(admin())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"CLOSED\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CLOSED"))
                .andExpect(jsonPath("$.closedAt", notNullValue()));
    }

    @Test
    void adminCanRejectAndRejectedReasonIsPersisted() throws Exception {
        long ticketId = createTicket(20L);

        mockMvc.perform(patch("/api/v1/tickets/{id}", ticketId)
                        .with(admin())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"REJECTED\",\"rejectedReason\":\"Duplicate ticket - already under investigation\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("REJECTED"))
                .andExpect(jsonPath("$.rejectedReason").value("Duplicate ticket - already under investigation"));
    }

    @Test
    void attachmentLimitIsCumulativeAndUnauthorizedUploadIsBlocked() throws Exception {
        long ticketId = createTicket(20L);

        MockMultipartFile file1 = image("one.png");
        MockMultipartFile file2 = image("two.png");

        mockMvc.perform(multipart("/api/v1/tickets/{id}/attachments", ticketId)
                        .file(file1)
                        .file(file2)
                        .with(reporter())
                        .with(request -> {
                            request.setMethod("POST");
                            return request;
                        }))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$[0]", notNullValue()));

        mockMvc.perform(multipart("/api/v1/tickets/{id}/attachments", ticketId)
                        .file(image("three.png"))
                        .file(image("four.png"))
                        .with(reporter())
                        .with(request -> {
                            request.setMethod("POST");
                            return request;
                        }))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("at most 3 attachments")));

        mockMvc.perform(multipart("/api/v1/tickets/{id}/attachments", ticketId)
                        .file(image("unauthorized.png"))
                        .with(otherUser())
                        .with(request -> {
                            request.setMethod("POST");
                            return request;
                        }))
                .andExpect(status().isForbidden());
    }

    @Test
    void ticketOwnershipAndCommentOwnershipRulesAreEnforced() throws Exception {
        long ticketId = createTicket(20L);

        mockMvc.perform(put("/api/v1/tickets/{id}", ticketId)
                        .with(otherUser())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(ticketRequestJson("Updated title")))
                .andExpect(status().isForbidden());

        mockMvc.perform(delete("/api/v1/tickets/{id}", ticketId)
                        .with(otherUser()))
                .andExpect(status().isForbidden());

        MvcResult commentResult = mockMvc.perform(post("/api/v1/tickets/{id}/comments", ticketId)
                        .with(reporter())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"content\":\"Initial comment\"}"))
                .andExpect(status().isCreated())
                .andReturn();

        JsonNode commentJson = objectMapper.readTree(commentResult.getResponse().getContentAsString());
        long commentId = commentJson.get("id").asLong();

        mockMvc.perform(put("/api/v1/tickets/{ticketId}/comments/{commentId}", ticketId, commentId)
                        .with(otherUser())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"content\":\"Try edit\"}"))
                .andExpect(status().isForbidden());

        mockMvc.perform(delete("/api/v1/tickets/{ticketId}/comments/{commentId}", ticketId, commentId)
                        .with(otherUser()))
                .andExpect(status().isForbidden());
    }

    @Test
    void notificationPreferencesCanDisableTicketNotifications() throws Exception {
        mockMvc.perform(patch("/api/v1/notifications/preferences/{type}", "TICKET_STATUS_CHANGED")
                        .header("X-User-Id", 20L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"enabled\":false}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.type").value("TICKET_STATUS_CHANGED"))
                .andExpect(jsonPath("$.enabled").value(false));

        long ticketId = createTicket(20L);

        mockMvc.perform(patch("/api/v1/tickets/{id}", ticketId)
                        .with(technician())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"IN_PROGRESS\"}"))
                .andExpect(status().isOk());

        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM notifications WHERE user_id = 20 AND type = 'TICKET_STATUS_CHANGED'",
                Integer.class
        );

        if (count == null || count != 0) {
            throw new AssertionError("Expected no TICKET_STATUS_CHANGED notification for user 20 when preference is disabled");
        }
    }

    private long createTicket(Long userId) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/v1/tickets")
                        .with(userId.equals(10L) ? admin() : userId.equals(30L) ? technician() : reporter())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(ticketRequestJson("Projector issue")))
                .andExpect(status().isCreated())
                .andReturn();

        JsonNode json = objectMapper.readTree(result.getResponse().getContentAsString());
        return json.get("id").asLong();
    }

    private String ticketRequestJson(String title) {
        return """
                {
                  "title": "%s",
                  "location": "A401",
                  "category": "PROJECTOR",
                  "description": "Projector does not turn on",
                  "resourceId": 100,
                  "requiredSkillId": 200,
                  "priority": "HIGH",
                  "preferredContact": "reporter@test.com"
                }
                """.formatted(title);
    }

    private MockMultipartFile image(String filename) {
        byte[] payload = new byte[]{1, 2, 3, 4, 5};
        return new MockMultipartFile("files", filename, MediaType.IMAGE_PNG_VALUE, payload);
    }

    private static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.UserRequestPostProcessor admin() {
        return user("admin@test.com").roles("ADMIN");
    }

    private static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.UserRequestPostProcessor reporter() {
        return user("reporter@test.com").roles("USER");
    }

    private static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.UserRequestPostProcessor technician() {
        return user("tech@test.com").roles("TECHNICIAN");
    }

    private static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.UserRequestPostProcessor otherUser() {
        return user("other@test.com").roles("USER");
    }
}
