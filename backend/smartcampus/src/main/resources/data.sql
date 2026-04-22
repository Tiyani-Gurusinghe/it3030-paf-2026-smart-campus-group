USE smart_campus_ops;
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
-- Updated to match shared resource types
-- =========================
INSERT IGNORE INTO resource_type_skills (resource_type, skill_id) VALUES

('LECTURE_HALL',1),('LECTURE_HALL',2),('LECTURE_HALL',3),('LECTURE_HALL',4),

('LAB',1),('LAB',2),('LAB',3),('LAB',4),

('MEETING_ROOM',1),('MEETING_ROOM',2),('MEETING_ROOM',3),('MEETING_ROOM',4),

('PROJECTOR',2),

('SMART_BOARD',2),

('PC',2),

('CHAIR',1),

('CHAIR',4);

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

-- Now aligned with shared resources

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

    7,

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

    6,

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

    5,

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

),

(

    4,

    'Interactive display not responding',

    'The smart board in the lab is frozen and touch input is not working.',

    9,

    2,

    'MEDIUM',

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

    DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 1 DAY),

    CURRENT_TIMESTAMP

),

(

    5,

    'Broken chairs in auditorium',

    'Several folding chairs are damaged and unsafe to use.',

    10,

    1,

    'LOW',

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

    DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 3 DAY),

    CURRENT_TIMESTAMP

),

(

    6,

    'Electrical issue in electrical lab',

    'Power sockets in the lab are not supplying electricity.',

    15,

    4,

    'HIGH',

    'IN_PROGRESS',

    10,

    40,

    NULL,

    NULL,

    DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 5 HOUR),

    DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 4 HOUR),

    40,

    NULL,

    NULL,

    DATE_ADD(DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 5 HOUR), INTERVAL 4 HOUR),

    CURRENT_TIMESTAMP

);

-- =========================

-- COMMENTS

-- =========================

INSERT IGNORE INTO comments (

    id,

    ticket_id,

    user_id,

    content,

    created_at,

    updated_at,

    deleted_at

) VALUES

(1, 1, 20, 'Issue noticed before the event started.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),

(2, 2, 30, 'Started checking network switch and access points.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL),

(3, 6, 40, 'Initial inspection done. Suspecting damaged wiring.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL);

-- =========================

-- ATTACHMENTS

-- =========================

INSERT IGNORE INTO attachments (

    id,

    ticket_id,

    file_url,

    uploaded_by,

    created_at

) VALUES

(1, 1, '/uploads/tickets/1/projector-1.jpg', 20, CURRENT_TIMESTAMP),

(2, 4, '/uploads/tickets/4/display-1.jpg', 20, CURRENT_TIMESTAMP),

(3, 5, '/uploads/tickets/5/chairs-1.jpg', 20, CURRENT_TIMESTAMP);

-- =========================

-- ASSIGNMENT HISTORY

-- =========================

INSERT IGNORE INTO ticket_assignment_history (

    id,

    ticket_id,

    from_user_id,

    to_user_id,

    changed_by,

    changed_at

) VALUES

(1, 1, NULL, 30, 10, CURRENT_TIMESTAMP),

(2, 2, NULL, 30, 10, CURRENT_TIMESTAMP),

(3, 3, NULL, 40, 10, CURRENT_TIMESTAMP),

(4, 6, NULL, 40, 10, CURRENT_TIMESTAMP);


-- =========================

-- NOTIFICATIONS

-- only if your notifications table already has:

-- (id, user_id, type, message, reference_id, is_read, created_at)

-- =========================

INSERT IGNORE INTO notifications (

    id,

    user_id,

    type,

    message,

    reference_id,

    is_read,

    created_at

) VALUES

(1, 20, 'TICKET_ASSIGNED', 'Your ticket "Projector not working" has been assigned.', 1, 0, CURRENT_TIMESTAMP),

(2, 20, 'TICKET_STATUS_CHANGED', 'Your ticket "WiFi outage in lab" is now IN_PROGRESS.', 2, 0, CURRENT_TIMESTAMP),

(3, 10, 'TICKET_STATUS_CHANGED', 'Your ticket "Power issue in auditorium" is now RESOLVED.', 3, 0, CURRENT_TIMESTAMP);