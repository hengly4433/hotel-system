Continue from the previous prompt: 001_Initialize_Project.md


- Below is a copy-pasteable, production-ready baseline for:

1. PostgreSQL DDL (core hotel system + audit + inventory-safe reservations + folio/payments + housekeeping/maintenance + full RBAC with Menus/Sub-Menus)
2. Next.js enterprise architecture (backend service + admin panel + storefront), with Controller → Service → Repository → DTO/Mapper, validation, exception handling, logging, audit tracking, and RBAC enforcement.

# PostgreSQL DDL (production baseline)

## Extensions + shared triggers

```sql
-- =========================
-- 001_extensions.sql
-- =========================
CREATE EXTENSION IF NOT EXISTS pgcrypto; -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS citext;   -- case-insensitive text (emails)

-- =========================
-- 002_shared_functions.sql
-- =========================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

```

## Enums (keep status logic consistent)

```sql
-- =========================
-- 010_enums.sql
-- =========================

DO $$ BEGIN
  CREATE TYPE user_status AS ENUM ('ACTIVE', 'SUSPENDED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE reservation_status AS ENUM (
    'HOLD', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED', 'NO_SHOW'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE room_op_status AS ENUM (
    'VACANT_CLEAN', 'VACANT_DIRTY', 'OCCUPIED', 'OUT_OF_ORDER', 'OUT_OF_SERVICE'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE channel_type AS ENUM ('DIRECT', 'OTA', 'WALKIN', 'CORPORATE');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE folio_status AS ENUM ('OPEN', 'CLOSED', 'VOID');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE folio_item_type AS ENUM (
    'ROOM_CHARGE', 'TAX', 'FEE', 'SERVICE', 'DISCOUNT', 'ADJUSTMENT'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payment_method AS ENUM ('CASH', 'CARD', 'BANK_TRANSFER', 'QR');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('AUTHORIZED', 'CAPTURED', 'FAILED', 'REFUNDED', 'VOIDED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE tax_fee_type AS ENUM ('PERCENT', 'FIXED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE housekeeping_status AS ENUM ('PENDING', 'IN_PROGRESS', 'DONE', 'INSPECTED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE maintenance_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE maintenance_status AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE work_shift AS ENUM ('AM', 'PM', 'NIGHT');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

```

## Multi-property foundation

```sql
-- =========================
-- 020_tenants.sql
-- =========================

CREATE TABLE IF NOT EXISTS organizations (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name         text NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT NOW(),
  updated_at   timestamptz NOT NULL DEFAULT NOW(),
  deleted_at   timestamptz NULL
);

CREATE TRIGGER trg_org_updated_at
BEFORE UPDATE ON organizations
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS properties (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  name            text NOT NULL,
  timezone        text NOT NULL DEFAULT 'Asia/Phnom_Penh',
  currency        text NOT NULL DEFAULT 'USD',
  address_line1   text NULL,
  address_line2   text NULL,
  city            text NULL,
  state           text NULL,
  postal_code     text NULL,
  country         text NULL,

  created_at      timestamptz NOT NULL DEFAULT NOW(),
  updated_at      timestamptz NOT NULL DEFAULT NOW(),
  deleted_at      timestamptz NULL
);

CREATE INDEX IF NOT EXISTS idx_properties_org ON properties(organization_id);

CREATE TRIGGER trg_properties_updated_at
BEFORE UPDATE ON properties
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
```

## RBAC (Users → Roles → Sub-Menus → Permissions)

### Why this design

- Permission checks secure APIs (resource/action).
- Sub-menu mapping controls UI navigation.
- Menu visibility is derived: if any sub-menu is visible, show the menu.

```sql
-- =========================
-- 030_rbac.sql
-- =========================

CREATE TABLE IF NOT EXISTS rbac_users (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id    uuid NULL REFERENCES properties(id), -- optional: staff belongs to a property

  email          citext NOT NULL,
  password_hash  text NOT NULL,
  status         user_status NOT NULL DEFAULT 'ACTIVE',

  last_login_at  timestamptz NULL,

  created_at     timestamptz NOT NULL DEFAULT NOW(),
  updated_at     timestamptz NOT NULL DEFAULT NOW(),
  deleted_at     timestamptz NULL
);

-- unique email for active (not soft-deleted) users
CREATE UNIQUE INDEX IF NOT EXISTS uq_rbac_users_email_active
ON rbac_users(email)
WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_rbac_users_property ON rbac_users(property_id);

CREATE TRIGGER trg_rbac_users_updated_at
BEFORE UPDATE ON rbac_users
FOR EACH ROW EXECUTE FUNCTION set_updated_at();


CREATE TABLE IF NOT EXISTS rbac_roles (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id  uuid NULL REFERENCES properties(id), -- property-scoped roles if needed
  name         text NOT NULL,

  created_at   timestamptz NOT NULL DEFAULT NOW(),
  updated_at   timestamptz NOT NULL DEFAULT NOW(),
  deleted_at   timestamptz NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_rbac_roles_name_property_active
ON rbac_roles(property_id, name)
WHERE deleted_at IS NULL;

CREATE TRIGGER trg_rbac_roles_updated_at
BEFORE UPDATE ON rbac_roles
FOR EACH ROW EXECUTE FUNCTION set_updated_at();


CREATE TABLE IF NOT EXISTS rbac_user_roles (
  user_id uuid NOT NULL REFERENCES rbac_users(id) ON DELETE CASCADE,
  role_id uuid NOT NULL REFERENCES rbac_roles(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id)
);

CREATE TABLE IF NOT EXISTS rbac_menus (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key        text NOT NULL,
  label      text NOT NULL,
  sort_order int  NOT NULL DEFAULT 0,

  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW(),
  deleted_at timestamptz NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_rbac_menus_key_active
ON rbac_menus(key) WHERE deleted_at IS NULL;

CREATE TRIGGER trg_rbac_menus_updated_at
BEFORE UPDATE ON rbac_menus
FOR EACH ROW EXECUTE FUNCTION set_updated_at();


CREATE TABLE IF NOT EXISTS rbac_submenus (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_id    uuid NOT NULL REFERENCES rbac_menus(id) ON DELETE CASCADE,
  key        text NOT NULL,
  label      text NOT NULL,
  route      text NOT NULL,
  sort_order int  NOT NULL DEFAULT 0,

  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW(),
  deleted_at timestamptz NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_rbac_submenus_menu_key_active
ON rbac_submenus(menu_id, key) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_rbac_submenus_menu ON rbac_submenus(menu_id);

CREATE TRIGGER trg_rbac_submenus_updated_at
BEFORE UPDATE ON rbac_submenus
FOR EACH ROW EXECUTE FUNCTION set_updated_at();


CREATE TABLE IF NOT EXISTS rbac_permissions (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resource  text NOT NULL, -- e.g. 'reservation'
  action    text NOT NULL, -- e.g. 'CREATE', 'CHECKIN'
  scope     text NULL,     -- optional: 'OWN', 'PROPERTY', 'ALL'

  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW(),
  deleted_at timestamptz NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_rbac_permissions_resource_action_scope_active
ON rbac_permissions(resource, action, COALESCE(scope, ''))
WHERE deleted_at IS NULL;

CREATE TRIGGER trg_rbac_permissions_updated_at
BEFORE UPDATE ON rbac_permissions
FOR EACH ROW EXECUTE FUNCTION set_updated_at();


CREATE TABLE IF NOT EXISTS rbac_role_permissions (
  role_id       uuid NOT NULL REFERENCES rbac_roles(id) ON DELETE CASCADE,
  permission_id uuid NOT NULL REFERENCES rbac_permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS rbac_role_submenus (
  role_id   uuid NOT NULL REFERENCES rbac_roles(id) ON DELETE CASCADE,
  submenu_id uuid NOT NULL REFERENCES rbac_submenus(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, submenu_id)
);

```

## People / Guests / Employees

```sql
-- =========================
-- 040_people.sql
-- =========================

CREATE TABLE IF NOT EXISTS people (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name    text NOT NULL,
  last_name     text NOT NULL,
  dob           date NULL,
  phone         text NULL,
  email         citext NULL,

  address_line1 text NULL,
  address_line2 text NULL,
  city          text NULL,
  state         text NULL,
  postal_code   text NULL,
  country       text NULL,

  created_at    timestamptz NOT NULL DEFAULT NOW(),
  updated_at    timestamptz NOT NULL DEFAULT NOW(),
  deleted_at    timestamptz NULL
);

CREATE INDEX IF NOT EXISTS idx_people_email ON people(email);
CREATE INDEX IF NOT EXISTS idx_people_phone ON people(phone);

CREATE TRIGGER trg_people_updated_at
BEFORE UPDATE ON people
FOR EACH ROW EXECUTE FUNCTION set_updated_at();


CREATE TABLE IF NOT EXISTS guests (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id   uuid NOT NULL REFERENCES people(id),
  notes       text NULL,
  loyalty_tier text NOT NULL DEFAULT 'NONE',

  created_at  timestamptz NOT NULL DEFAULT NOW(),
  updated_at  timestamptz NOT NULL DEFAULT NOW(),
  deleted_at  timestamptz NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_guests_person_active
ON guests(person_id) WHERE deleted_at IS NULL;

CREATE TRIGGER trg_guests_updated_at
BEFORE UPDATE ON guests
FOR EACH ROW EXECUTE FUNCTION set_updated_at();


CREATE TABLE IF NOT EXISTS employees (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id   uuid NOT NULL REFERENCES properties(id),
  person_id     uuid NOT NULL REFERENCES people(id),
  job_title     text NULL,
  hire_date     date NULL,
  hourly_rate   numeric(12,2) NULL,
  employment_status text NOT NULL DEFAULT 'ACTIVE',

  created_at    timestamptz NOT NULL DEFAULT NOW(),
  updated_at    timestamptz NOT NULL DEFAULT NOW(),
  deleted_at    timestamptz NULL
);

CREATE INDEX IF NOT EXISTS idx_employees_property ON employees(property_id);

CREATE TRIGGER trg_employees_updated_at
BEFORE UPDATE ON employees
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

```

## Pricing (rate plans + nightly prices + taxes/fees)

```sql
-- =========================
-- 060_pricing.sql
-- =========================

CREATE TABLE IF NOT EXISTS cancellation_policies (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES properties(id),
  name        text NOT NULL,
  rules       jsonb NOT NULL, -- e.g. {"free_cancel_before_days":2,"no_show_fee_nights":1}

  created_at  timestamptz NOT NULL DEFAULT NOW(),
  updated_at  timestamptz NOT NULL DEFAULT NOW(),
  deleted_at  timestamptz NULL
);

CREATE INDEX IF NOT EXISTS idx_cancel_policy_property ON cancellation_policies(property_id);

CREATE TRIGGER trg_cancellation_policies_updated_at
BEFORE UPDATE ON cancellation_policies
FOR EACH ROW EXECUTE FUNCTION set_updated_at();


CREATE TABLE IF NOT EXISTS rate_plans (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES properties(id),
  code        text NOT NULL,
  name        text NOT NULL,
  is_refundable boolean NOT NULL DEFAULT true,
  includes_breakfast boolean NOT NULL DEFAULT false,
  cancellation_policy_id uuid NULL REFERENCES cancellation_policies(id),

  created_at  timestamptz NOT NULL DEFAULT NOW(),
  updated_at  timestamptz NOT NULL DEFAULT NOW(),
  deleted_at  timestamptz NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_rate_plans_property_code_active
ON rate_plans(property_id, code) WHERE deleted_at IS NULL;

CREATE TRIGGER trg_rate_plans_updated_at
BEFORE UPDATE ON rate_plans
FOR EACH ROW EXECUTE FUNCTION set_updated_at();


CREATE TABLE IF NOT EXISTS rate_plan_prices (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rate_plan_id uuid NOT NULL REFERENCES rate_plans(id) ON DELETE CASCADE,
  room_type_id uuid NOT NULL REFERENCES room_types(id) ON DELETE CASCADE,
  date         date NOT NULL,
  price        numeric(12,2) NOT NULL CHECK (price >= 0),
  currency     text NOT NULL DEFAULT 'USD',

  created_at   timestamptz NOT NULL DEFAULT NOW(),
  updated_at   timestamptz NOT NULL DEFAULT NOW(),
  deleted_at   timestamptz NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_rate_plan_prices_unique_active
ON rate_plan_prices(rate_plan_id, room_type_id, date)
WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_rate_plan_prices_lookup
ON rate_plan_prices(room_type_id, date);

CREATE TRIGGER trg_rate_plan_prices_updated_at
BEFORE UPDATE ON rate_plan_prices
FOR EACH ROW EXECUTE FUNCTION set_updated_at();


CREATE TABLE IF NOT EXISTS taxes_fees (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES properties(id),
  name        text NOT NULL,
  type        tax_fee_type NOT NULL,
  value       numeric(12,4) NOT NULL CHECK (value >= 0),
  applies_to  text NOT NULL DEFAULT 'ALL', -- ROOM/SERVICE/ALL
  is_active   boolean NOT NULL DEFAULT true,

  created_at  timestamptz NOT NULL DEFAULT NOW(),
  updated_at  timestamptz NOT NULL DEFAULT NOW(),
  deleted_at  timestamptz NULL
);

CREATE INDEX IF NOT EXISTS idx_taxes_fees_property ON taxes_fees(property_id);

CREATE TRIGGER trg_taxes_fees_updated_at
BEFORE UPDATE ON taxes_fees
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

```

## Reservations (inventory-safe)

### Key production rule

#### Never allow a double-booked room for the same night. The simplest reliable pattern is:

- Create reservation_nights rows per assigned room per date
- Enforce a unique partial index on (room_id, date) where not soft-deleted
- When cancelling, soft-delete those nights (releases inventory)

```sql
-- =========================
-- 070_reservations.sql
-- =========================

CREATE TABLE IF NOT EXISTS reservations (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id     uuid NOT NULL REFERENCES properties(id),
  code            text NOT NULL, -- human-friendly code e.g. RES-2026-000123
  primary_guest_id uuid NOT NULL REFERENCES guests(id),

  status          reservation_status NOT NULL DEFAULT 'HOLD',
  channel         channel_type NOT NULL DEFAULT 'DIRECT',

  check_in_date   date NOT NULL,
  check_out_date  date NOT NULL,
  adults          int  NOT NULL DEFAULT 1 CHECK (adults >= 0),
  children        int  NOT NULL DEFAULT 0 CHECK (children >= 0),

  special_requests text NULL,

  created_at      timestamptz NOT NULL DEFAULT NOW(),
  updated_at      timestamptz NOT NULL DEFAULT NOW(),
  deleted_at      timestamptz NULL,

  CONSTRAINT chk_dates CHECK (check_out_date > check_in_date)
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_reservations_property_code_active
ON reservations(property_id, code) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_reservations_property_dates_status
ON reservations(property_id, check_in_date, check_out_date, status);

CREATE TRIGGER trg_reservations_updated_at
BEFORE UPDATE ON reservations
FOR EACH ROW EXECUTE FUNCTION set_updated_at();


CREATE TABLE IF NOT EXISTS reservation_guests (
  reservation_id uuid NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  guest_id       uuid NOT NULL REFERENCES guests(id),
  role           text NOT NULL DEFAULT 'ADDITIONAL', -- PRIMARY/ADDITIONAL
  PRIMARY KEY (reservation_id, guest_id)
);


CREATE TABLE IF NOT EXISTS reservation_rooms (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id uuid NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,

  room_type_id  uuid NOT NULL REFERENCES room_types(id),
  room_id       uuid NULL REFERENCES rooms(id), -- assigned at check-in or later

  rate_plan_id  uuid NOT NULL REFERENCES rate_plans(id),

  guests_in_room int NOT NULL DEFAULT 1 CHECK (guests_in_room >= 0),

  -- Audit snapshot of calculated pricing rules (optional but recommended)
  nightly_rate_snapshot jsonb NULL,

  created_at    timestamptz NOT NULL DEFAULT NOW(),
  updated_at    timestamptz NOT NULL DEFAULT NOW(),
  deleted_at    timestamptz NULL
);

CREATE INDEX IF NOT EXISTS idx_reservation_rooms_reservation
ON reservation_rooms(reservation_id);

CREATE INDEX IF NOT EXISTS idx_reservation_rooms_room
ON reservation_rooms(room_id);

CREATE TRIGGER trg_reservation_rooms_updated_at
BEFORE UPDATE ON reservation_rooms
FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- Inventory lock rows (one per night)
CREATE TABLE IF NOT EXISTS reservation_nights (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_room_id uuid NOT NULL REFERENCES reservation_rooms(id) ON DELETE CASCADE,

  room_id             uuid NOT NULL REFERENCES rooms(id),
  date                date NOT NULL,

  price               numeric(12,2) NOT NULL CHECK (price >= 0),
  currency            text NOT NULL DEFAULT 'USD',

  created_at          timestamptz NOT NULL DEFAULT NOW(),
  updated_at          timestamptz NOT NULL DEFAULT NOW(),
  deleted_at          timestamptz NULL
);

-- Hard guarantee: no two active reservation_nights for same room/date
CREATE UNIQUE INDEX IF NOT EXISTS uq_reservation_nights_room_date_active
ON reservation_nights(room_id, date)
WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_reservation_nights_room_date
ON reservation_nights(room_id, date);

CREATE TRIGGER trg_reservation_nights_updated_at
BEFORE UPDATE ON reservation_nights
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

```

## Folio accounting + payments (auditable)

```sql
-- =========================
-- 080_folio.sql
-- =========================

CREATE TABLE IF NOT EXISTS folios (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id uuid NOT NULL REFERENCES reservations(id),
  status        folio_status NOT NULL DEFAULT 'OPEN',
  currency      text NOT NULL DEFAULT 'USD',

  created_at    timestamptz NOT NULL DEFAULT NOW(),
  updated_at    timestamptz NOT NULL DEFAULT NOW(),
  deleted_at    timestamptz NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_folios_reservation_active
ON folios(reservation_id) WHERE deleted_at IS NULL;

CREATE TRIGGER trg_folios_updated_at
BEFORE UPDATE ON folios
FOR EACH ROW EXECUTE FUNCTION set_updated_at();


CREATE TABLE IF NOT EXISTS folio_items (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  folio_id    uuid NOT NULL REFERENCES folios(id) ON DELETE CASCADE,

  type        folio_item_type NOT NULL,
  description text NOT NULL,
  qty         numeric(12,4) NOT NULL DEFAULT 1 CHECK (qty >= 0),
  unit_price  numeric(12,2) NOT NULL DEFAULT 0 CHECK (unit_price >= 0),
  amount      numeric(12,2) NOT NULL CHECK (amount >= 0),

  posted_at   timestamptz NOT NULL DEFAULT NOW(),
  posted_by   uuid NULL REFERENCES rbac_users(id),

  created_at  timestamptz NOT NULL DEFAULT NOW(),
  updated_at  timestamptz NOT NULL DEFAULT NOW(),
  deleted_at  timestamptz NULL
);

CREATE INDEX IF NOT EXISTS idx_folio_items_folio_posted_at
ON folio_items(folio_id, posted_at DESC);

CREATE TRIGGER trg_folio_items_updated_at
BEFORE UPDATE ON folio_items
FOR EACH ROW EXECUTE FUNCTION set_updated_at();


CREATE TABLE IF NOT EXISTS payments (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  folio_id       uuid NOT NULL REFERENCES folios(id) ON DELETE CASCADE,

  method         payment_method NOT NULL,
  amount         numeric(12,2) NOT NULL CHECK (amount >= 0),
  currency       text NOT NULL DEFAULT 'USD',

  status         payment_status NOT NULL DEFAULT 'AUTHORIZED',
  provider       text NULL,  -- e.g. 'stripe'
  provider_ref   text NULL,  -- e.g. payment_intent_id
  idempotency_key text NOT NULL,

  created_by     uuid NULL REFERENCES rbac_users(id),
  created_at     timestamptz NOT NULL DEFAULT NOW(),
  updated_at     timestamptz NOT NULL DEFAULT NOW(),
  deleted_at     timestamptz NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_payments_idempotency_active
ON payments(idempotency_key)
WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_payments_folio_status_created
ON payments(folio_id, status, created_at DESC);

CREATE TRIGGER trg_payments_updated_at
BEFORE UPDATE ON payments
FOR EACH ROW EXECUTE FUNCTION set_updated_at();


CREATE TABLE IF NOT EXISTS refunds (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id   uuid NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  amount       numeric(12,2) NOT NULL CHECK (amount >= 0),
  provider_ref text NULL,
  status       payment_status NOT NULL DEFAULT 'REFUNDED',

  created_at   timestamptz NOT NULL DEFAULT NOW(),
  updated_at   timestamptz NOT NULL DEFAULT NOW(),
  deleted_at   timestamptz NULL
);

CREATE INDEX IF NOT EXISTS idx_refunds_payment ON refunds(payment_id);

CREATE TRIGGER trg_refunds_updated_at
BEFORE UPDATE ON refunds
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

```

## Housekeeping + maintenance

```sql
-- =========================
-- 090_ops.sql
-- =========================

CREATE TABLE IF NOT EXISTS housekeeping_tasks (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id   uuid NOT NULL REFERENCES properties(id),
  room_id       uuid NOT NULL REFERENCES rooms(id),

  task_date     date NOT NULL,
  shift         work_shift NOT NULL DEFAULT 'AM',
  status        housekeeping_status NOT NULL DEFAULT 'PENDING',
  assigned_to_employee_id uuid NULL REFERENCES employees(id),

  checklist     jsonb NULL,

  created_at    timestamptz NOT NULL DEFAULT NOW(),
  updated_at    timestamptz NOT NULL DEFAULT NOW(),
  deleted_at    timestamptz NULL
);

CREATE INDEX IF NOT EXISTS idx_housekeeping_board
ON housekeeping_tasks(property_id, task_date, shift, status);

CREATE TRIGGER trg_housekeeping_tasks_updated_at
BEFORE UPDATE ON housekeeping_tasks
FOR EACH ROW EXECUTE FUNCTION set_updated_at();


CREATE TABLE IF NOT EXISTS maintenance_tickets (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id   uuid NOT NULL REFERENCES properties(id),
  room_id       uuid NOT NULL REFERENCES rooms(id),

  priority      maintenance_priority NOT NULL DEFAULT 'MEDIUM',
  status        maintenance_status NOT NULL DEFAULT 'OPEN',
  description   text NOT NULL,

  reported_by_user_id uuid NULL REFERENCES rbac_users(id),
  assigned_to_employee_id uuid NULL REFERENCES employees(id),

  opened_at     timestamptz NOT NULL DEFAULT NOW(),
  closed_at     timestamptz NULL,

  created_at    timestamptz NOT NULL DEFAULT NOW(),
  updated_at    timestamptz NOT NULL DEFAULT NOW(),
  deleted_at    timestamptz NULL
);

CREATE INDEX IF NOT EXISTS idx_maintenance_property_status
ON maintenance_tickets(property_id, status, priority);

CREATE TRIGGER trg_maintenance_tickets_updated_at
BEFORE UPDATE ON maintenance_tickets
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

```

## Audit log (immutable history for compliance)

```sql
-- =========================
-- 100_audit.sql
-- =========================

CREATE TABLE IF NOT EXISTS audit_logs (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id   uuid NULL REFERENCES properties(id),
  actor_user_id uuid NULL REFERENCES rbac_users(id),

  entity_type   text NOT NULL,
  entity_id     uuid NULL,
  action        text NOT NULL,

  before        jsonb NULL,
  after         jsonb NULL,

  request_id    text NULL,
  ip            text NULL,
  user_agent    text NULL,

  created_at    timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_property_time
ON audit_logs(property_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_entity
ON audit_logs(entity_type, entity_id, created_at DESC);

```

## RBAC seed example (menus + submenus + permissions)

### Use this as a starting point (you will add more resources/actions as you build):

```sql
-- =========================
-- 110_seed_rbac.sql (example)
-- =========================

-- MENUS
INSERT INTO rbac_menus (key, label, sort_order)
VALUES
  ('dashboard','Dashboard',1),
  ('reservations','Reservations',2),
  ('rooms','Rooms',3),
  ('finance','Finance',4),
  ('settings','Settings',99)
ON CONFLICT DO NOTHING;

-- SUBMENUS
INSERT INTO rbac_submenus (menu_id, key, label, route, sort_order)
SELECT m.id, s.key, s.label, s.route, s.sort_order
FROM rbac_menus m
JOIN (VALUES
  ('reservations','reservations.list','Reservation List','/admin/reservations',1),
  ('reservations','reservations.create','Create Reservation','/admin/reservations/new',2),
  ('reservations','reservations.checkin','Check-in','/admin/checkin',3),
  ('rooms','rooms.board','Room Board','/admin/rooms/board',1),
  ('finance','finance.folios','Folios & Payments','/admin/finance/folios',1),
  ('settings','settings.rbac','RBAC','/admin/settings/rbac',1)
) AS s(menu_key,key,label,route,sort_order)
ON s.menu_key = m.key
ON CONFLICT DO NOTHING;

-- PERMISSIONS
INSERT INTO rbac_permissions (resource, action, scope)
VALUES
  ('reservation','CREATE','PROPERTY'),
  ('reservation','READ','PROPERTY'),
  ('reservation','UPDATE','PROPERTY'),
  ('reservation','CANCEL','PROPERTY'),
  ('reservation','CHECKIN','PROPERTY'),
  ('reservation','CHECKOUT','PROPERTY'),
  ('room','READ','PROPERTY'),
  ('room','UPDATE_STATUS','PROPERTY'),
  ('folio','READ','PROPERTY'),
  ('payment','CAPTURE','PROPERTY'),
  ('rbac','ADMIN','PROPERTY')
ON CONFLICT DO NOTHING;

```

