-- Ticket module patch: authorization-driven state fields, SLA timestamps, and notification preferences
-- Apply manually to the target MySQL schema.

ALTER TABLE tickets
    ADD COLUMN IF NOT EXISTS resolution_notes TEXT NULL,
    ADD COLUMN IF NOT EXISTS rejected_reason TEXT NULL,
    ADD COLUMN IF NOT EXISTS first_responded_at DATETIME NULL,
    ADD COLUMN IF NOT EXISTS resolved_at DATETIME NULL;

CREATE TABLE IF NOT EXISTS notification_preferences (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    type VARCHAR(50) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_notification_preferences_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uk_notification_pref_user_type UNIQUE (user_id, type)
);
