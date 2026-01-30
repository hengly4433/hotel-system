-- Audit logs, timesheets, and room-type inventory locks.

-- =========================
-- Audit logs
-- =========================
CREATE TABLE IF NOT EXISTS audit_logs (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id   uuid NULL,
  actor_user_id uuid NULL REFERENCES rbac_users(id),

  entity_type   text NOT NULL,
  entity_id     uuid NULL,
  action        text NOT NULL,

  before        jsonb NULL,
  after         jsonb NULL,

  request_id    text NULL,
  ip            text NULL,
  user_agent    text NULL,

  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_property_time
ON audit_logs(property_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_entity
ON audit_logs(entity_type, entity_id, created_at DESC);

-- =========================
-- Timesheets
-- =========================
DO $$ BEGIN
  CREATE TYPE timesheet_status AS ENUM ('OPEN', 'SUBMITTED', 'APPROVED', 'REJECTED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS employee_timesheets (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id    uuid NOT NULL REFERENCES properties(id),
  employee_id    uuid NOT NULL REFERENCES employees(id),
  work_date      date NOT NULL,
  shift          work_shift NOT NULL DEFAULT 'AM',
  clock_in       timestamptz NULL,
  clock_out      timestamptz NULL,
  break_minutes  int NOT NULL DEFAULT 0 CHECK (break_minutes >= 0),
  total_minutes  int NOT NULL DEFAULT 0 CHECK (total_minutes >= 0),
  status         timesheet_status NOT NULL DEFAULT 'OPEN',
  notes          text NULL,

  created_at     timestamptz NOT NULL DEFAULT NOW(),
  updated_at     timestamptz NOT NULL DEFAULT NOW(),
  deleted_at     timestamptz NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_employee_timesheets_unique_active
ON employee_timesheets(employee_id, work_date, shift)
WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_employee_timesheets_property_date
ON employee_timesheets(property_id, work_date DESC);

CREATE TRIGGER trg_employee_timesheets_updated_at
BEFORE UPDATE ON employee_timesheets
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =========================
-- Room-type inventory locks (for unassigned reservations)
-- =========================
CREATE TABLE IF NOT EXISTS reservation_type_nights (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_room_id uuid NOT NULL REFERENCES reservation_rooms(id) ON DELETE CASCADE,
  room_type_id         uuid NOT NULL REFERENCES room_types(id),
  date                date NOT NULL,

  price               numeric(12,2) NOT NULL CHECK (price >= 0),
  currency            text NOT NULL DEFAULT 'USD',

  created_at          timestamptz NOT NULL DEFAULT NOW(),
  updated_at          timestamptz NOT NULL DEFAULT NOW(),
  deleted_at          timestamptz NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_reservation_type_nights_room_date_active
ON reservation_type_nights(reservation_room_id, date)
WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_reservation_type_nights_type_date
ON reservation_type_nights(room_type_id, date);

CREATE TRIGGER trg_reservation_type_nights_updated_at
BEFORE UPDATE ON reservation_type_nights
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
