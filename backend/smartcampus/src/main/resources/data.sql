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
(10, 'google', 'admin1', 'Admin User', 'admin@test.com', CURRENT_TIMESTAMP),
(20, 'google', 'user1', 'Normal User', 'user@test.com', CURRENT_TIMESTAMP),
(30, 'google', 'tech1', 'Alice Technician', 'alice@test.com', CURRENT_TIMESTAMP),
(40, 'google', 'tech2', 'Bob Electrician', 'bob@test.com', CURRENT_TIMESTAMP),
(50, 'google', 'tech3', 'Charlie HVAC', 'charlie@test.com', CURRENT_TIMESTAMP),
(60, 'google', 'user2', 'Nimal Perera', 'nimal@test.com', CURRENT_TIMESTAMP),
(70, 'google', 'user3', 'Ayesha Silva', 'ayesha@test.com', CURRENT_TIMESTAMP);

-- =========================
-- USER ROLES
-- =========================
INSERT IGNORE INTO user_roles (user_id, role_id) VALUES
(10, 1),
(20, 2),
(30, 3),
(40, 3),
(50, 3),
(60, 2),
(70, 2);

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
-- building-level issues
('ACADEMIC', 1),
('ACADEMIC', 3),
('ACADEMIC', 4),

-- spaces
('LECTURE_HALL', 1),
('LECTURE_HALL', 2),
('LECTURE_HALL', 3),
('LECTURE_HALL', 4),

('LAB', 1),
('LAB', 2),
('LAB', 3),
('LAB', 4),

('MEETING_ROOM', 1),
('MEETING_ROOM', 2),
('MEETING_ROOM', 3),
('MEETING_ROOM', 4),

-- equipment/resource-specific mappings
('PROJECTOR', 2),
('PROJECTOR', 4),

('PC', 2),
('SMART_BOARD', 2),
('SMART_BOARD', 4),

('CHAIR', 1);

-- =========================
-- TECHNICIAN SKILLS
-- =========================
INSERT IGNORE INTO technician_skills (user_id, skill_id) VALUES
(30, 1),
(30, 2),
(40, 4),
(50, 3),
(50, 1);

-- =========================
-- RESOURCES (Hierarchical)
-- =========================
INSERT IGNORE INTO resources (id, resource_name, resource_type, resource_category, config_type, floor, capacity, location, status, parent_id, created_at)
VALUES
  (1, 'Main Building', 'ACADEMIC', 'BUILDING', 'NONE', NULL, 5000, 'Main Campus', 'ACTIVE', NULL, CURRENT_TIMESTAMP),
  (2, 'New Building', 'ACADEMIC', 'BUILDING', 'NONE', NULL, 3000, 'Main Campus', 'ACTIVE', NULL, CURRENT_TIMESTAMP),
  (3, 'Business Building', 'ACADEMIC', 'BUILDING', 'NONE', NULL, 4000, 'Main Campus', 'ACTIVE', NULL, CURRENT_TIMESTAMP),
  (4, 'Engineering Building', 'ACADEMIC', 'BUILDING', 'NONE', NULL, 6000, 'Main Campus', 'ACTIVE', NULL, CURRENT_TIMESTAMP),
  (5, 'Main Auditorium', 'LECTURE_HALL', 'SPACE', 'FLEXIBLE', 'Floor 1', 300, 'Main Building', 'ACTIVE', 1, CURRENT_TIMESTAMP),
  (6, 'Software Lab', 'LAB', 'SPACE', 'FLEXIBLE', 'Floor 2', 60, 'Main Building', 'ACTIVE', 1, CURRENT_TIMESTAMP),
  (7, '4K Laser Projector', 'PROJECTOR', 'EQUIPMENT', 'NONE', NULL, 1, 'Above stage', 'ACTIVE', 5, CURRENT_TIMESTAMP),
  (8, 'Dell Workstations', 'PC', 'EQUIPMENT', 'NONE', NULL, 60, 'Lab Desks', 'ACTIVE', 6, CURRENT_TIMESTAMP),
  (9, 'Interactive Display', 'SMART_BOARD', 'EQUIPMENT', 'NONE', NULL, 2, 'Main Desk', 'ACTIVE', 6, CURRENT_TIMESTAMP),
  (10, 'Folding Chairs', 'CHAIR', 'EQUIPMENT', 'NONE', NULL, 50, 'Store Room B', 'ACTIVE', NULL, CURRENT_TIMESTAMP),
  (11, 'Network Lab', 'LAB', 'SPACE', 'FLEXIBLE', 'Floor 1', 40, 'New Building', 'ACTIVE', 2, CURRENT_TIMESTAMP),
  (12, 'Architecture Studio', 'LAB', 'SPACE', 'FIXED', 'Floor 3', 30, 'New Building', 'ACTIVE', 2, CURRENT_TIMESTAMP),
  (13, 'Business Hall A', 'LECTURE_HALL', 'SPACE', 'FIXED', 'Ground Floor', 150, 'Business Building', 'ACTIVE', 3, CURRENT_TIMESTAMP),
  (14, 'Mechanical Workshop', 'LAB', 'SPACE', 'FIXED', 'Lower Ground', 80, 'Engineering Building', 'ACTIVE', 4, CURRENT_TIMESTAMP),
  (15, 'Electrical Lab', 'LAB', 'SPACE', 'FLEXIBLE', 'Floor 2', 45, 'Engineering Building', 'ACTIVE', 4, CURRENT_TIMESTAMP);

-- =========================
-- RESOURCE FACULTIES
-- =========================
INSERT IGNORE INTO resource_faculties (resource_id, faculty) VALUES
(1, 'COMPUTING'),
(1, 'GRADUATE_STUDIES'),
(1, 'INTERNATIONAL_PROGRAMMES'),
(2, 'COMPUTING'),
(2, 'ARCHITECTURE'),
(3, 'BUSINESS'),
(4, 'ENGINEERING'),
(5, 'COMPUTING'),
(6, 'COMPUTING'),
(11, 'COMPUTING'),
(12, 'ARCHITECTURE'),
(13, 'BUSINESS'),
(14, 'ENGINEERING'),
(15, 'ENGINEERING');


-- =========================
-- TICKETS
-- =========================
INSERT IGNORE INTO tickets (
    id, title, location, category, description, priority, preferred_contact, status,
    reported_by, assigned_to, resource_id, required_skill_id, due_at, closed_at,
    attachment_urls, created_at, updated_at
) VALUES
(1,
 'Projector not turning on',
 'Main Auditorium',
 'EQUIPMENT',
 'The 4K laser projector in the main auditorium does not power on before lectures.',
 'HIGH',
 'user@test.com',
 'OPEN',
 20, 30, 7, 2,
 DATE_ADD(NOW(), INTERVAL 4 HOUR),
 NULL,
 JSON_ARRAY('/uploads/tickets/1/projector-front.jpg', '/uploads/tickets/1/projector-cable.jpg'),
 CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
),

(2,
 'Electrical sparks near lab switchboard',
 'Electrical Lab',
 'SAFETY',
 'Small sparks observed near the switchboard in Electrical Lab when powering equipment.',
 'HIGH',
 'ayesha@test.com',
 'IN_PROGRESS',
 70, 40, 15, 4,
 DATE_ADD(NOW(), INTERVAL 4 HOUR),
 NULL,
 JSON_ARRAY('/uploads/tickets/2/switchboard.jpg'),
 CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
),

(3,
 'Air conditioning not cooling',
 'Architecture Studio',
 'FACILITY',
 'The studio is unusually hot and the air conditioning is not cooling properly during lectures.',
 'MEDIUM',
 'nimal@test.com',
 'OPEN',
 60, 50, 12, 3,
 DATE_ADD(NOW(), INTERVAL 1 DAY),
 NULL,
 NULL,
 CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
),

(4,
 'Broken chairs in hall',
 'Business Hall A',
 'FURNITURE',
 'Several chairs in Business Hall A are broken and unsafe for student use.',
 'LOW',
 'user@test.com',
 'OPEN',
 20, 30, 13, 1,
 DATE_ADD(NOW(), INTERVAL 3 DAY),
 NULL,
 NULL,
 CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
),

(5,
 'Lab computers cannot access internet',
 'Network Lab',
 'NETWORK',
 'Most workstations in Network Lab have no internet access since this morning.',
 'HIGH',
 'ayesha@test.com',
 'IN_PROGRESS',
 70, 30, 11, 2,
 DATE_ADD(NOW(), INTERVAL 4 HOUR),
 NULL,
 JSON_ARRAY('/uploads/tickets/5/network-lab-error.png'),
 CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);

-- =========================
-- TICKET HISTORY
-- =========================
INSERT IGNORE INTO ticket_history (
    id, ticket_id, actor_user_id, action_type, from_status, to_status,
    previous_assignee, new_assignee, note, created_at
) VALUES
(1, 1, 20, 'CREATED', NULL, 'OPEN', NULL, NULL,
 'Ticket created by user for auditorium projector issue.', CURRENT_TIMESTAMP),
(2, 1, 10, 'ASSIGNED', NULL, NULL, NULL, 30,
 'Auto-assigned to Alice Technician based on IT support skill.', CURRENT_TIMESTAMP),

(3, 2, 70, 'CREATED', NULL, 'OPEN', NULL, NULL,
 'Electrical hazard reported in Electrical Lab.', CURRENT_TIMESTAMP),
(4, 2, 10, 'ASSIGNED', NULL, NULL, NULL, 40,
 'Assigned to Bob Electrician.', CURRENT_TIMESTAMP),
(5, 2, 40, 'STATUS_CHANGED', 'OPEN', 'IN_PROGRESS', 40, 40,
 'Started inspection of affected switchboard.', CURRENT_TIMESTAMP),

(6, 3, 60, 'CREATED', NULL, 'OPEN', NULL, NULL,
 'Cooling issue reported in Architecture Studio.', CURRENT_TIMESTAMP),
(7, 3, 10, 'ASSIGNED', NULL, NULL, NULL, 50,
 'Assigned to Charlie HVAC.', CURRENT_TIMESTAMP),

(8, 4, 20, 'CREATED', NULL, 'OPEN', NULL, NULL,
 'Broken chairs reported in Business Hall A.', CURRENT_TIMESTAMP),
(9, 4, 10, 'ASSIGNED', NULL, NULL, NULL, 30,
 'Assigned as general maintenance task.', CURRENT_TIMESTAMP),

(10, 5, 70, 'CREATED', NULL, 'OPEN', NULL, NULL,
 'Network outage reported in Network Lab.', CURRENT_TIMESTAMP),
(11, 5, 10, 'ASSIGNED', NULL, NULL, NULL, 30,
 'Assigned to Alice Technician.', CURRENT_TIMESTAMP),
(12, 5, 30, 'STATUS_CHANGED', 'OPEN', 'IN_PROGRESS', 30, 30,
 'Diagnosing switch and router connectivity.', CURRENT_TIMESTAMP);

-- =========================
-- NOTIFICATIONS
-- =========================
INSERT IGNORE INTO notifications (
    id, user_id, ticket_id, type, title, message, is_read, created_at
) VALUES
(1, 30, 1, 'TICKET_ASSIGNED', 'New ticket assigned', 'Projector not turning on has been assigned to you.', FALSE, CURRENT_TIMESTAMP),
(2, 40, 2, 'TICKET_ASSIGNED', 'New ticket assigned', 'Electrical sparks near lab switchboard has been assigned to you.', FALSE, CURRENT_TIMESTAMP),
(3, 50, 3, 'TICKET_ASSIGNED', 'New ticket assigned', 'Air conditioning not cooling has been assigned to you.', FALSE, CURRENT_TIMESTAMP),
(4, 30, 4, 'TICKET_ASSIGNED', 'New ticket assigned', 'Broken chairs in hall has been assigned to you.', FALSE, CURRENT_TIMESTAMP),
(5, 30, 5, 'TICKET_ASSIGNED', 'New ticket assigned', 'Lab computers cannot access internet has been assigned to you.', FALSE, CURRENT_TIMESTAMP),
(6, 70, 2, 'TICKET_UPDATED', 'Ticket status updated', 'Your ticket Electrical sparks near lab switchboard is now IN_PROGRESS.', FALSE, CURRENT_TIMESTAMP),
(7, 70, 5, 'Ticket status updated', 'Ticket status updated', 'Your ticket Lab computers cannot access internet is now IN_PROGRESS.', FALSE, CURRENT_TIMESTAMP);

-- =========================
-- AUDIT LOGS
-- =========================
INSERT IGNORE INTO audit_logs (
    id, actor_user_id, entity_type, entity_id, action, details, created_at
) VALUES
(1, 10, 'TICKET', 1, 'ASSIGN', 'Assigned ticket 1 to user 30', CURRENT_TIMESTAMP),
(2, 10, 'TICKET', 2, 'ASSIGN', 'Assigned ticket 2 to user 40', CURRENT_TIMESTAMP),
(3, 10, 'TICKET', 3, 'ASSIGN', 'Assigned ticket 3 to user 50', CURRENT_TIMESTAMP),
(4, 10, 'TICKET', 4, 'ASSIGN', 'Assigned ticket 4 to user 30', CURRENT_TIMESTAMP),
(5, 10, 'TICKET', 5, 'ASSIGN', 'Assigned ticket 5 to user 30', CURRENT_TIMESTAMP),
(6, 40, 'TICKET', 2, 'STATUS_CHANGE', 'Changed status from OPEN to IN_PROGRESS', CURRENT_TIMESTAMP),
(7, 30, 'TICKET', 5, 'STATUS_CHANGE', 'Changed status from OPEN to IN_PROGRESS', CURRENT_TIMESTAMP);