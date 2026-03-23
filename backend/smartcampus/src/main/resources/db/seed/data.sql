USE smart_campus_ops;

-- Roles
INSERT INTO roles (name) VALUES
('USER'),
('ADMIN'),
('TECHNICIAN');

-- Users
INSERT INTO users (oauth_provider, oauth_id, full_name, email) VALUES
('google', 'google-001', 'Admin User', 'admin@smartcampus.com'),
('google', 'google-002', 'Normal User', 'user@smartcampus.com'),
('google', 'google-003', 'Tech User', 'tech@smartcampus.com');

-- Assign roles
INSERT INTO user_roles (user_id, role_id) VALUES
(1, 2), -- Admin User -> ADMIN
(2, 1), -- Normal User -> USER
(3, 3); -- Tech User -> TECHNICIAN

-- Resources
INSERT INTO resources (resource_name, resource_type, capacity, location, availability_start, availability_end, status) VALUES
('Lecture Hall A', 'LECTURE_HALL', 120, 'Block A - Floor 1', '08:00:00', '18:00:00', 'ACTIVE'),
('Computer Lab 1', 'LAB', 40, 'Block B - Floor 2', '08:00:00', '17:00:00', 'ACTIVE'),
('Meeting Room 2', 'MEETING_ROOM', 12, 'Admin Building - Floor 3', '09:00:00', '17:00:00', 'ACTIVE'),
('Projector X120', 'EQUIPMENT', NULL, 'Equipment Store', '08:00:00', '16:00:00', 'OUT_OF_SERVICE');

-- Sample bookings
INSERT INTO bookings (user_id, resource_id, booking_date, start_time, end_time, purpose, expected_attendees, status, admin_reason) VALUES
(2, 1, '2026-03-15', '10:00:00', '12:00:00', 'Final year presentation', 80, 'APPROVED', 'Approved for academic use'),
(2, 3, '2026-03-16', '14:00:00', '15:00:00', 'Project meeting', 6, 'PENDING', NULL);

-- Sample tickets
INSERT INTO tickets (reported_by, resource_id, location, category, description, priority, preferred_contact, assigned_to, status, resolution_notes) VALUES
(2, 4, 'Equipment Store', 'Projector Fault', 'Projector not powering on', 'HIGH', '0771234567', 3, 'IN_PROGRESS', NULL),
(2, 2, 'Block B - Floor 2', 'PC Issue', 'Several PCs are slow and freezing', 'MEDIUM', 'user@smartcampus.com', 3, 'OPEN', NULL);

-- Sample comments
INSERT INTO ticket_comments (ticket_id, user_id, comment_text) VALUES
(1, 2, 'This issue was noticed during the morning lecture.'),
(1, 3, 'Inspection started. Will update after diagnosis.');

-- Notifications
INSERT INTO notifications (user_id, message, is_read) VALUES
(2, 'Your booking for Lecture Hall A has been approved.', FALSE),
(2, 'Your ticket for Projector X120 is now IN_PROGRESS.', FALSE);

-- Audit logs
INSERT INTO audit_logs (actor_user_id, action_type, entity_type, entity_id, action_details) VALUES
(1, 'APPROVE_BOOKING', 'BOOKING', 1, 'Approved booking request for Lecture Hall A'),
(3, 'UPDATE_TICKET_STATUS', 'TICKET', 1, 'Changed status from OPEN to IN_PROGRESS');