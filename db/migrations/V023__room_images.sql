-- Add profile_image to rooms table
ALTER TABLE rooms ADD COLUMN profile_image VARCHAR(255);

-- Create room_images table
CREATE TABLE room_images (
    id UUID PRIMARY KEY,
    room_id UUID NOT NULL,
    url VARCHAR(255) NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    deleted_at TIMESTAMP,
    CONSTRAINT fk_room_images_room_id FOREIGN KEY (room_id) REFERENCES rooms(id)
);

CREATE INDEX idx_room_images_room_id ON room_images(room_id);
