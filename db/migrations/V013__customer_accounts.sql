CREATE TABLE IF NOT EXISTS customer_accounts (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id     uuid NOT NULL REFERENCES people(id),
  guest_id      uuid NOT NULL REFERENCES guests(id),
  email         citext NOT NULL,
  password_hash text NOT NULL,
  status        text NOT NULL DEFAULT 'ACTIVE',
  last_login_at timestamptz NULL,

  created_at    timestamptz NOT NULL DEFAULT NOW(),
  updated_at    timestamptz NOT NULL DEFAULT NOW(),
  deleted_at    timestamptz NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_customer_accounts_email_active
ON customer_accounts(email)
WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_customer_accounts_person_active
ON customer_accounts(person_id)
WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_customer_accounts_guest_active
ON customer_accounts(guest_id)
WHERE deleted_at IS NULL;

CREATE TRIGGER trg_customer_accounts_updated_at
BEFORE UPDATE ON customer_accounts
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
