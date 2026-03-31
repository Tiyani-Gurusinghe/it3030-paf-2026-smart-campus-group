-- Step 1: Seed users WITHOUT the role column (safe fallback if column is still being added)
MERGE INTO users (oauth_provider, oauth_id, full_name, email, created_at)
KEY(email) VALUES
  ('local', 'u1', 'Normal User', 'user@test.com',  CURRENT_TIMESTAMP),
  ('local', 'u2', 'Admin User',  'admin@test.com', CURRENT_TIMESTAMP),
  ('local', 'u3', 'Tech Staff',  'tech@test.com',  CURRENT_TIMESTAMP);

-- Step 2: Set roles (UPDATE is safe if the role column exists — no-op if not)
UPDATE users SET role = 'STUDENT' WHERE email = 'user@test.com';
UPDATE users SET role = 'ADMIN'   WHERE email = 'admin@test.com';
UPDATE users SET role = 'STAFF'   WHERE email = 'tech@test.com';

-- Step 3: Seed dummy tickets (only if none exist)
INSERT INTO tickets (title, location, category, description, priority, preferred_contact, status, assigned_to, resolution_notes, reported_by, created_at, updated_at)
SELECT * FROM (VALUES
  ('Projector not working', 'Block A Room 101', 'PROJECTOR',
   'The projector fails to connect via HDMI. Tried multiple cables with no luck.',
   'HIGH', 'user@test.com', 'OPEN', NULL, NULL, 1,
   CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

  ('WiFi outage on 2nd Floor', 'Library 2nd Floor', 'NETWORK',
   'Complete WiFi outage on the library second floor since 9am. Students cannot access online resources.',
   'HIGH', 'user@test.com', 'IN_PROGRESS', 'Tech Staff', NULL, 1,
   DATEADD(DAY, -1, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP),

  ('Broken chairs in lecture hall', 'Block B Room 204', 'FURNITURE',
   'Several chairs are broken and students cannot sit. Creating a safety hazard.',
   'LOW', 'user@test.com', 'RESOLVED', 'Tech Staff',
   'Chairs replaced with new ones from storage room. Area cleared.', 1,
   DATEADD(DAY, -3, CURRENT_TIMESTAMP), DATEADD(DAY, -1, CURRENT_TIMESTAMP)),

  ('AC not cooling in staff room', 'Staff Room 3', 'ELECTRICAL',
   'The AC unit is running but not producing cool air. Temperature is very uncomfortable.',
   'MEDIUM', 'admin@test.com', 'OPEN', NULL, NULL, 2,
   DATEADD(DAY, -2, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP),

  ('Cleaning required urgently', 'Canteen', 'CLEANING',
   'Large spillage near the canteen entrance. Slip hazard for students.',
   'HIGH', 'admin@test.com', 'CLOSED', 'Tech Staff',
   'Area cleaned and wet floor signs placed. Hazard resolved.', 2,
   DATEADD(DAY, -5, CURRENT_TIMESTAMP), DATEADD(DAY, -4, CURRENT_TIMESTAMP))
) WHERE (SELECT COUNT(*) FROM tickets) = 0;
