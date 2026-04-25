-- Run this locally once before using due-date extension fields.
-- It does not require any application-dev.properties changes.

ALTER TABLE tickets
    ADD COLUMN original_due_at DATETIME NULL AFTER due_at,
    ADD COLUMN due_extended_at DATETIME NULL AFTER closed_at,
    ADD COLUMN due_extended_by BIGINT NULL AFTER due_extended_at,
    ADD COLUMN due_extension_note TEXT NULL AFTER due_extended_by,
    ADD CONSTRAINT fk_tickets_due_extended_by
        FOREIGN KEY (due_extended_by) REFERENCES users(id) ON DELETE SET NULL;

UPDATE tickets
SET original_due_at = due_at
WHERE original_due_at IS NULL;

-- Optional audit seed for tickets you may have manually extended before adding this feature.
-- This inserts one history row per ticket that already has extension metadata.
INSERT INTO ticket_history (
    ticket_id,
    actor_user_id,
    action_type,
    note,
    created_at
)
SELECT
    t.id,
    t.due_extended_by,
    'DUE_EXTENDED',
    CONCAT('Due date extended to ', DATE_FORMAT(t.due_at, '%Y-%m-%d %H:%i:%s'), '. Note: ', t.due_extension_note),
    COALESCE(t.due_extended_at, CURRENT_TIMESTAMP)
FROM tickets t
WHERE t.due_extended_by IS NOT NULL
  AND t.due_extension_note IS NOT NULL
  AND NOT EXISTS (
      SELECT 1
      FROM ticket_history h
      WHERE h.ticket_id = t.id
        AND h.action_type = 'DUE_EXTENDED'
  );
