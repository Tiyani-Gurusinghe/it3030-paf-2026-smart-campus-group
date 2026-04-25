USE smartcampusdb;

-- Roles
INSERT INTO roles (name) VALUES
('USER'),
('ADMIN'),
('TECHNICIAN');

-- Users
INSERT IGNORE INTO users (
    id,
    oauth_provider,
    oauth_id,
    full_name,
    email,
    campus_id,
    password,
    created_at
) VALUES
(10, 'google', 'admin1', 'Admin User', 'admin@test.com', 'IT20260001', '$2a$10$pt0NDXY9Hx7.XKfM5fmWNefFKUZ4vIwnqkSclXJ32vOEL.pTSzyUG', CURRENT_TIMESTAMP),
(20, 'google', 'user1', 'Normal User', 'user@test.com', 'IT20260002', '$2a$10$pt0NDXY9Hx7.XKfM5fmWNefFKUZ4vIwnqkSclXJ32vOEL.pTSzyUG', CURRENT_TIMESTAMP),
(30, 'google', 'tech1', 'Alice Technician', 'alice@test.com', 'IT20260003', '$2a$10$pt0NDXY9Hx7.XKfM5fmWNefFKUZ4vIwnqkSclXJ32vOEL.pTSzyUG', CURRENT_TIMESTAMP),
(40, 'google', 'tech2', 'Bob Electrician', 'bob@test.com', 'IT20260004', '$2a$10$pt0NDXY9Hx7.XKfM5fmWNefFKUZ4vIwnqkSclXJ32vOEL.pTSzyUG', CURRENT_TIMESTAMP),
(50, 'google', 'tech3', 'Charlie HVAC', 'charlie@test.com', 'IT20260005', '$2a$10$pt0NDXY9Hx7.XKfM5fmWNefFKUZ4vIwnqkSclXJ32vOEL.pTSzyUG', CURRENT_TIMESTAMP),
(60, 'google', 'user2', 'Nimal Perera', 'nimal@test.com', 'IT20260006', '$2a$10$pt0NDXY9Hx7.XKfM5fmWNefFKUZ4vIwnqkSclXJ32vOEL.pTSzyUG', CURRENT_TIMESTAMP),
(70, 'google', 'user3', 'Ayesha Silva', 'ayesha@test.com', 'IT20260007', '$2a$10$pt0NDXY9Hx7.XKfM5fmWNefFKUZ4vIwnqkSclXJ32vOEL.pTSzyUG', CURRENT_TIMESTAMP);

--- =========================
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
