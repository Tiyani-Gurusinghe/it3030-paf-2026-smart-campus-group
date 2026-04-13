-- =========================
-- ROLES
-- =========================
INSERT IGNORE INTO roles (id, name) VALUES
(1, 'ADMIN'),
(2, 'USER'),
(3, 'TECHNICIAN');

-- =========================
-- USERS
-- =========================
INSERT IGNORE INTO users (id, oauth_provider, oauth_id, full_name, email, created_at) VALUES
(10, 'google', 'admin1', 'Admin User', 'admin2@test.com', CURRENT_TIMESTAMP),
(20, 'google', 'user1', 'Normal User', 'user2@test.com', CURRENT_TIMESTAMP),
(30, 'google', 'tech1', 'Alice Technician', 'alice@test.com', CURRENT_TIMESTAMP),
(40, 'google', 'tech2', 'Bob Electrician', 'bob@test.com', CURRENT_TIMESTAMP);

-- =========================
-- USER ROLES
-- =========================
INSERT IGNORE INTO user_roles (user_id, role_id) VALUES
(10, 1),
(20, 2),
(30, 3),
(40, 3);

-- =========================
-- SKILLS
-- =========================
INSERT IGNORE INTO skills (id, name) VALUES
(1, 'GENERAL_MAINTENANCE'),
(2, 'IT_SUPPORT'),
(3, 'HVAC_SYSTEM'),
(4, 'ELECTRICAL');

-- =========================
-- RESOURCE TYPE SKILLS
-- =========================
INSERT IGNORE INTO resource_type_skills (resource_type, skill_id) VALUES
('LECTURE_HALL',1),('LECTURE_HALL',2),('LECTURE_HALL',3),('LECTURE_HALL',4),
('LAB',1),('LAB',2),('LAB',3),('LAB',4),
('MEETING_ROOM',1),('MEETING_ROOM',2),('MEETING_ROOM',3),('MEETING_ROOM',4),
('EQUIPMENT',2),('EQUIPMENT',4);

-- =========================
-- TECHNICIAN SKILLS
-- =========================
INSERT IGNORE INTO technician_skills (user_id, skill_id) VALUES
(30, 2),
(30, 1),
(40, 4);

-- =========================
-- RESOURCES (Hierarchical)
-- =========================
INSERT IGNORE INTO resources (id, resource_name, resource_type, resource_category, capacity, location, status, parent_id, created_at)
VALUES
  (1, 'Computing Building', 'ACADEMIC', 'BUILDING', 5000, 'Main Campus', 'ACTIVE', NULL, CURRENT_TIMESTAMP),
  (2, 'Central Library', 'LIBRARY', 'BUILDING', 2000, 'Main Campus', 'ACTIVE', NULL, CURRENT_TIMESTAMP),
  (3, 'Main Auditorium', 'LECTURE_HALL', 'SPACE', 300, 'Computing Building Floor 1', 'ACTIVE', 1, CURRENT_TIMESTAMP),
  (4, 'Software Lab', 'LAB', 'SPACE', 60, 'Computing Building Floor 2', 'ACTIVE', 1, CURRENT_TIMESTAMP),
  (5, '4K Laser Projector', 'PROJECTOR', 'EQUIPMENT', 1, 'Above stage', 'ACTIVE', 3, CURRENT_TIMESTAMP),
  (6, 'Dell Workstations', 'COMPUTER', 'EQUIPMENT', 60, 'Lab Desks', 'ACTIVE', 4, CURRENT_TIMESTAMP);

-- =========================
-- TICKETS
-- =========================
INSERT IGNORE INTO tickets (
    id,
    title,
    description,
    resource_id,
    required_skill_id,
    priority,
    status,
    reported_by,
    assigned_to,
    resolution_notes,
    rejected_reason,
    created_at,
    first_response_at,
    first_responded_by,
    resolved_at,
    closed_at,
    due_at,
    updated_at
) VALUES
(
    1,
    'Projector not working',
    'The projector fails to connect via HDMI. Tried multiple cables with no luck.',
    5,
    2,
    'HIGH',
    'OPEN',
    20,
    30,
    NULL,
    NULL,
    CURRENT_TIMESTAMP,
    NULL,
    NULL,
    NULL,
    NULL,
    DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 4 HOUR),
    CURRENT_TIMESTAMP
),
(
    2,
    'WiFi outage in lab',
    'Complete network outage in the lab since morning.',
    4,
    2,
    'HIGH',
    'IN_PROGRESS',
    20,
    30,
    NULL,
    NULL,
    DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 1 DAY),
    DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 23 HOUR),
    30,
    NULL,
    NULL,
    DATE_ADD(DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 1 DAY), INTERVAL 4 HOUR),
    CURRENT_TIMESTAMP
),
(
    3,
    'Power issue in auditorium',
    'Power sockets are not working properly.',
    3,
    4,
    'MEDIUM',
    'RESOLVED',
    10,
    40,
    'Checked wiring and restored power connection.',
    NULL,
    DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 3 DAY),
    DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 3 DAY),
    40,
    DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 2 DAY),
    NULL,
    DATE_ADD(DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 3 DAY), INTERVAL 1 DAY),
    CURRENT_TIMESTAMP
);
