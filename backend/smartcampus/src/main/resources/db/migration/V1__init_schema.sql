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

-- =========================

-- TICKETS

-- =========================

CREATE TABLE IF NOT EXISTS tickets (

    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    title VARCHAR(120) NOT NULL,

    description VARCHAR(2000) NOT NULL,

    resource_id BIGINT NOT NULL,

    required_skill_id BIGINT NOT NULL,

    priority ENUM('LOW','MEDIUM','HIGH') NOT NULL,

    status ENUM('OPEN','IN_PROGRESS','RESOLVED','CLOSED','REJECTED') NOT NULL DEFAULT 'OPEN',

    reported_by BIGINT NOT NULL,

    assigned_to BIGINT NULL,

    resolution_notes VARCHAR(4000) NULL,

    rejected_reason VARCHAR(4000) NULL,

    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    first_response_at DATETIME(6) NULL,

    first_responded_by BIGINT NULL,

    resolved_at DATETIME(6) NULL,

    closed_at DATETIME(6) NULL,

    due_at DATETIME(6) NULL,

    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),

    CONSTRAINT fk_tickets_resource

        FOREIGN KEY (resource_id) REFERENCES resources(id),

    CONSTRAINT fk_tickets_required_skill

        FOREIGN KEY (required_skill_id) REFERENCES skills(id),

    CONSTRAINT fk_tickets_reported_by

        FOREIGN KEY (reported_by) REFERENCES users(id),

    CONSTRAINT fk_tickets_assigned_to

        FOREIGN KEY (assigned_to) REFERENCES users(id),

    CONSTRAINT fk_tickets_first_responded_by

        FOREIGN KEY (first_responded_by) REFERENCES users(id)

);

-- =========================
-- Ticket Comments
-- =========================

CREATE TABLE IF NOT EXISTS comments (

    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    ticket_id BIGINT NOT NULL,

    user_id BIGINT NOT NULL,

    content VARCHAR(2000) NOT NULL,

    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    updated_at DATETIME(6) NULL DEFAULT NULL,

    deleted_at DATETIME(6) NULL DEFAULT NULL,

    CONSTRAINT fk_comments_ticket

        FOREIGN KEY (ticket_id) REFERENCES tickets(id),

    CONSTRAINT fk_comments_user

        FOREIGN KEY (user_id) REFERENCES users(id)

);

-- =========================

-- ATTACHMENTS

-- =========================

CREATE TABLE IF NOT EXISTS attachments (

    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    ticket_id BIGINT NOT NULL,

    file_url VARCHAR(255) NOT NULL,

    uploaded_by BIGINT NOT NULL,

    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    CONSTRAINT fk_attachments_ticket

        FOREIGN KEY (ticket_id) REFERENCES tickets(id),

    CONSTRAINT fk_attachments_user

        FOREIGN KEY (uploaded_by) REFERENCES users(id)

);

-- =========================

-- TICKET ASSIGNMENT HISTORY

-- =========================

CREATE TABLE IF NOT EXISTS ticket_assignment_history (

    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    ticket_id BIGINT NOT NULL,

    from_user_id BIGINT NULL,

    to_user_id BIGINT NULL,

    changed_by BIGINT NOT NULL,

    changed_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    CONSTRAINT fk_tah_ticket

        FOREIGN KEY (ticket_id) REFERENCES tickets(id),

    CONSTRAINT fk_tah_from_user

        FOREIGN KEY (from_user_id) REFERENCES users(id),

    CONSTRAINT fk_tah_to_user

        FOREIGN KEY (to_user_id) REFERENCES users(id),

    CONSTRAINT fk_tah_changed_by

        FOREIGN KEY (changed_by) REFERENCES users(id)

);

-- =========================

-- INDEXES

-- =========================

CREATE INDEX idx_tickets_status ON tickets(status);

CREATE INDEX idx_tickets_assigned_to ON tickets(assigned_to);

CREATE INDEX idx_tickets_reported_by ON tickets(reported_by);

CREATE INDEX idx_comments_ticket_id ON comments(ticket_id);

CREATE INDEX idx_attachments_ticket_id ON attachments(ticket_id);

CREATE INDEX idx_tah_ticket_id ON ticket_assignment_history(ticket_id);

-- =========================
-- Notifications
-- =========================
CREATE TABLE notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    message VARCHAR(255) NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =========================
-- Audit Logs
-- =========================
CREATE TABLE audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    actor_user_id BIGINT,
    action_type VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id BIGINT NOT NULL,
    action_details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_logs_actor FOREIGN KEY (actor_user_id) REFERENCES users(id) ON DELETE SET NULL
);