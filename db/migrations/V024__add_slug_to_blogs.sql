-- Add slug column to blogs table
ALTER TABLE blogs ADD COLUMN slug VARCHAR(255) UNIQUE;

-- Generate slugs for existing records based on title
UPDATE blogs SET slug = LOWER(REPLACE(REPLACE(REPLACE(title, ' ', '-'), '''', ''), ',', '')) WHERE slug IS NULL;
