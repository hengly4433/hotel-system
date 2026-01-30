CREATE TABLE IF NOT EXISTS room_type_images (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_type_id uuid NOT NULL REFERENCES room_types(id) ON DELETE CASCADE,
  url          text NOT NULL,
  sort_order   int NOT NULL DEFAULT 0,
  is_primary   boolean NOT NULL DEFAULT false,

  created_at   timestamptz NOT NULL DEFAULT NOW(),
  updated_at   timestamptz NOT NULL DEFAULT NOW(),
  deleted_at   timestamptz NULL
);

CREATE INDEX IF NOT EXISTS idx_room_type_images_type
ON room_type_images(room_type_id, sort_order);

CREATE TRIGGER trg_room_type_images_updated_at
BEFORE UPDATE ON room_type_images
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
