-- SLA fields and status event timelines, plus employee profile details.

ALTER TABLE employees
  ADD COLUMN IF NOT EXISTS department text,
  ADD COLUMN IF NOT EXISTS skills jsonb,
  ADD COLUMN IF NOT EXISTS photo_url text;

ALTER TABLE housekeeping_tasks
  ADD COLUMN IF NOT EXISTS due_at timestamptz NULL;

ALTER TABLE maintenance_tickets
  ADD COLUMN IF NOT EXISTS due_at timestamptz NULL;

CREATE TABLE IF NOT EXISTS housekeeping_task_events (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id            uuid NOT NULL REFERENCES housekeeping_tasks(id) ON DELETE CASCADE,
  status             housekeeping_status NOT NULL,
  changed_by_user_id uuid NULL REFERENCES rbac_users(id),
  changed_at         timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_housekeeping_task_events_task
ON housekeeping_task_events(task_id, changed_at DESC);

CREATE TABLE IF NOT EXISTS maintenance_ticket_events (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id          uuid NOT NULL REFERENCES maintenance_tickets(id) ON DELETE CASCADE,
  status             maintenance_status NOT NULL,
  changed_by_user_id uuid NULL REFERENCES rbac_users(id),
  changed_at         timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_maintenance_ticket_events_ticket
ON maintenance_ticket_events(ticket_id, changed_at DESC);
