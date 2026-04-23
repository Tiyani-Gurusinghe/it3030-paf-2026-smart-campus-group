-- ========================================================
-- SMART CAMPUS SYSTEM - COMPLETE SCHEMA (MySQL)
-- ========================================================

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS audit_logs, notifications, ticket_comments, tickets, 
                     bookings, resource_faculties, resource_type_skills, 
                     technician_skills, resources, user_roles, users, roles, skills;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Roles
CREATE TABLE roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- 2. Users (Matched to your MySQL Screenshot)
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    oauth_provider VARCHAR(50),
    oauth_id VARCHAR(100) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Skills
CREATE TABLE skills (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

-- 4. User Roles (Junction Table)
CREATE TABLE user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- 5. Technician Skills (Junction Table)
CREATE TABLE technician_skills (
    user_id BIGINT NOT NULL,
    skill_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, skill_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
);

-- 6. Resources
CREATE TABLE resources (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    resource_name VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,     -- e.g., 'LECTURE_HALL', 'LAB', 'PROJECTOR'
    resource_category VARCHAR(50),          -- e.g., 'BUILDING', 'SPACE', 'EQUIPMENT'
    config_type VARCHAR(50),                -- e.g., 'FIXED', 'FLEXIBLE'
    floor VARCHAR(255),
    capacity INT,
    location VARCHAR(150) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    parent_id BIGINT,                       -- Allows for building -> room -> equipment hierarchy
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    availability_start TIME,
    availability_end TIME,
    CONSTRAINT fk_resource_parent FOREIGN KEY (parent_id) REFERENCES resources(id) ON DELETE SET NULL
);
-- 7. Resource Type Skills (Mapping Skills to Resource Types)
CREATE TABLE resource_type_skills (
    resource_type VARCHAR(50) NOT NULL,
    skill_id BIGINT NOT NULL,
    PRIMARY KEY (resource_type, skill_id),
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
);

-- 8. Resource Faculties
CREATE TABLE resource_faculties (
    resource_id BIGINT NOT NULL,
    faculty VARCHAR(50) NOT NULL,
    PRIMARY KEY (resource_id, faculty),
    FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE
);

-- 9. Bookings
CREATE TABLE bookings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    resource_id BIGINT NOT NULL,
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    purpose VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (resource_id) REFERENCES resources(id)
);

-- 10. Tickets

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

-- =========================================================
-- 13. AUDIT LOGS
-- =========================================================
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