MERGE INTO users (oauth_provider, oauth_id, full_name, email, created_at)
KEY(email)
VALUES
('local', 'u1', 'Normal User', 'user@test.com', CURRENT_TIMESTAMP),
('local', 'u2', 'Admin User', 'admin@test.com', CURRENT_TIMESTAMP);
