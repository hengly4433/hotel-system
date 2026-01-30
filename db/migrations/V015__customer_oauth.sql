ALTER TABLE customer_accounts
  ADD COLUMN IF NOT EXISTS auth_provider text NOT NULL DEFAULT 'LOCAL',
  ADD COLUMN IF NOT EXISTS provider_subject text;

ALTER TABLE customer_accounts
  ALTER COLUMN password_hash DROP NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_customer_accounts_provider_subject_active
ON customer_accounts(provider_subject)
WHERE deleted_at IS NULL AND provider_subject IS NOT NULL;
