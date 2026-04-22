-- =========================
-- Roles
-- =========================
CREATE TABLE roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);


-- =========================
-- Users
-- =========================
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    role VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    oauth_provider VARCHAR(50),
    oauth_id VARCHAR(100) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- =========================
-- User Roles
-- =========================
CREATE TABLE user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- =========================
-- SKILLS
-- =========================

CREATE TABLE IF NOT EXISTS skills (

    id BIGINT PRIMARY KEY,

    name VARCHAR(100) NOT NULL

);

-- =========================
-- RESOURCE TYPE SKILLS
-- Align with shared ResourceType enum
-- =========================

CREATE TABLE IF NOT EXISTS resource_type_skills (

    resource_type ENUM(

        'LECTURE_HALL',

        'LAB',

        'MEETING_ROOM',

        'PROJECTOR',

        'PC',

        'SMART_BOARD',

        'CHAIR'

    ) NOT NULL,

    skill_id BIGINT NOT NULL,

    PRIMARY KEY (resource_type, skill_id),

    CONSTRAINT fk_resource_type_skills_skill

        FOREIGN KEY (skill_id) REFERENCES skills(id)

);

-- =========================
-- TECHNICIAN SKILLS
-- =========================

CREATE TABLE IF NOT EXISTS technician_skills (
    user_id BIGINT NOT NULL,
    skill_id BIGINT NOT NULL,

    PRIMARY KEY (user_id, skill_id),
    CONSTRAINT fk_technician_skills_user
        FOREIGN KEY (user_id) REFERENCES users(id),

    CONSTRAINT fk_technician_skills_skill

        FOREIGN KEY (skill_id) REFERENCES skills(id)

);
-- =========================
-- Resources
-- =========================
CREATE TABLE resources (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    resource_name VARCHAR(100) NOT NULL,
    resource_type ENUM('LECTURE_HALL', 'LAB', 'MEETING_ROOM', 'EQUIPMENT') NOT NULL,
    capacity INT,
    location VARCHAR(150) NOT NULL,
    availability_start TIME,
    availability_end TIME,
    status ENUM('ACTIVE', 'OUT_OF_SERVICE') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- Bookings
-- =========================
CREATE TABLE bookings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    resource_id BIGINT NOT NULL,
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    purpose VARCHAR(255) NOT NULL,
    expected_attendees INT,
    status ENUM('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    admin_reason VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_bookings_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_bookings_resource FOREIGN KEY (resource_id) REFERENCES resources(id),
    CONSTRAINT chk_booking_time CHECK (start_time < end_time)
);

-- =========================================================
-- 10. TICKETS
-- Compact ticket design:
-- - attachment_urls keeps file references in one place
-- - ticket_history handles comments/assignment/status log
-- =========================================================
CREATE TABLE tickets (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(120) NOT NULL,
    location VARCHAR(120) NOT NULL,
    category VARCHAR(30) NOT NULL,
    description VARCHAR(1000) NOT NULL,
    priority VARCHAR(20) NOT NULL,
    preferred_contact VARCHAR(120) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN',

    reported_by BIGINT NOT NULL,
    assigned_to BIGINT NULL,

    resource_id BIGINT NOT NULL,
    required_skill_id BIGINT NOT NULL,

    due_at DATETIME NULL,
    closed_at DATETIME NULL,

    attachment_urls JSON NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_tickets_reported_by
        FOREIGN KEY (reported_by) REFERENCES users(id),
    CONSTRAINT fk_tickets_assigned_to
        FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_tickets_resource
        FOREIGN KEY (resource_id) REFERENCES resources(id),
    CONSTRAINT fk_tickets_required_skill
        FOREIGN KEY (required_skill_id) REFERENCES skills(id)
);

-- =========================================================
-- 11. TICKET HISTORY
-- One table for:
-- - assignment history
-- - status changes
-- - internal notes / comments
-- - activity timeline
-- =========================================================
CREATE TABLE ticket_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ticket_id BIGINT NOT NULL,
    actor_user_id BIGINT NOT NULL,
    action_type VARCHAR(30) NOT NULL,
    from_status VARCHAR(20) NULL,
    to_status VARCHAR(20) NULL,
    previous_assignee BIGINT NULL,
    new_assignee BIGINT NULL,
    note TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_ticket_history_ticket
        FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
    CONSTRAINT fk_ticket_history_actor
        FOREIGN KEY (actor_user_id) REFERENCES users(id),
    CONSTRAINT fk_ticket_history_previous_assignee
        FOREIGN KEY (previous_assignee) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_ticket_history_new_assignee
        FOREIGN KEY (new_assignee) REFERENCES users(id) ON DELETE SET NULL
);

-- =========================================================
-- 12. NOTIFICATIONS
-- =========================================================
CREATE TABLE notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    ticket_id BIGINT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(150) NOT NULL,
    message VARCHAR(500) NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_notifications_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_notifications_ticket
        FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
);
-- =========================
-- Audit Logs
-- =========================
CREATE TABLE audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    actor_user_id BIGINT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id BIGINT NOT NULL,
    action VARCHAR(50) NOT NULL,
    details VARCHAR(1000) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_audit_logs_actor
        FOREIGN KEY (actor_user_id) REFERENCES users(id) ON DELETE SET NULL
);