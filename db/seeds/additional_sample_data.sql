-- Additional sample data: organizations, properties, room types, rooms, rate plans, prices, images
-- Idempotent inserts: safe to run multiple times.

-- =====================================
-- Organization: Aurora Hospitality Group
-- =====================================
INSERT INTO organizations (name)
SELECT 'Aurora Hospitality Group'
WHERE NOT EXISTS (
  SELECT 1 FROM organizations WHERE name = 'Aurora Hospitality Group' AND deleted_at IS NULL
);

-- =====================================
-- Property: Aurora Bay Resort (California)
-- =====================================
WITH org AS (
  SELECT id FROM organizations WHERE name = 'Aurora Hospitality Group' AND deleted_at IS NULL
), prop_ins AS (
  INSERT INTO properties (
    organization_id, name, timezone, currency,
    address_line1, city, state, postal_code, country
  )
  SELECT org.id, 'Aurora Bay Resort', 'America/Los_Angeles', 'USD',
         '100 Ocean View Dr', 'Monterey', 'CA', '93940', 'USA'
  FROM org
  WHERE NOT EXISTS (
    SELECT 1 FROM properties p
    WHERE p.organization_id = org.id
      AND p.name = 'Aurora Bay Resort'
      AND p.deleted_at IS NULL
  )
  RETURNING id
), prop AS (
  SELECT id FROM prop_ins
  UNION ALL
  SELECT p.id FROM properties p
  JOIN org ON p.organization_id = org.id
  WHERE p.name = 'Aurora Bay Resort' AND p.deleted_at IS NULL
), room_types_upsert AS (
  INSERT INTO room_types (
    property_id, code, name, max_adults, max_children, max_occupancy,
    base_description, default_bed_type
  )
  SELECT prop.id, rt.code, rt.name, rt.max_adults, rt.max_children, rt.max_occupancy,
         rt.base_description, rt.default_bed_type
  FROM prop
  JOIN (VALUES
    ('AB-STD', 'Coastal Standard', 2, 1, 3, 'Bright standard room with coastal accents and lounge nook.', 'Queen'),
    ('AB-DEL', 'Ocean Deluxe', 2, 2, 4, 'Upgraded ocean-facing room with balcony seating.', 'King'),
    ('AB-SUI', 'Seaview Suite', 3, 2, 5, 'Spacious suite with separate lounge and panoramic water views.', 'King')
  ) AS rt(code, name, max_adults, max_children, max_occupancy, base_description, default_bed_type)
    ON true
  WHERE NOT EXISTS (
    SELECT 1 FROM room_types existing
    WHERE existing.property_id = prop.id
      AND existing.code = rt.code
      AND existing.deleted_at IS NULL
  )
  RETURNING id, code
), room_types_all AS (
  SELECT rt.id, rt.code
  FROM room_types rt
  JOIN prop ON rt.property_id = prop.id
  WHERE rt.deleted_at IS NULL AND rt.code IN ('AB-STD', 'AB-DEL', 'AB-SUI')
), room_numbers AS (
  SELECT rt.id AS room_type_id,
         CASE rt.code
           WHEN 'AB-STD' THEN 100
           WHEN 'AB-DEL' THEN 200
           WHEN 'AB-SUI' THEN 300
         END AS base_number,
         CASE rt.code
           WHEN 'AB-STD' THEN 10
           WHEN 'AB-DEL' THEN 8
           WHEN 'AB-SUI' THEN 6
         END AS room_count
  FROM room_types_all rt
)
INSERT INTO rooms (property_id, room_type_id, room_number, floor, housekeeping_zone, is_active)
SELECT prop.id,
       rn.room_type_id,
       (rn.base_number + gs)::text AS room_number,
       CASE
         WHEN rn.base_number < 200 THEN '1'
         WHEN rn.base_number < 300 THEN '2'
         ELSE '3'
       END AS floor,
       CASE
         WHEN rn.base_number < 200 THEN 'A'
         WHEN rn.base_number < 300 THEN 'B'
         ELSE 'C'
       END AS housekeeping_zone,
       true
FROM prop
JOIN room_numbers rn ON true
JOIN generate_series(1, rn.room_count) gs ON true
WHERE NOT EXISTS (
  SELECT 1 FROM rooms r
  WHERE r.property_id = prop.id
    AND r.room_number = (rn.base_number + gs)::text
    AND r.deleted_at IS NULL
);

WITH org AS (
  SELECT id FROM organizations WHERE name = 'Aurora Hospitality Group' AND deleted_at IS NULL
), prop AS (
  SELECT p.id FROM properties p
  JOIN org ON p.organization_id = org.id
  WHERE p.name = 'Aurora Bay Resort' AND p.deleted_at IS NULL
), cancel_policies AS (
  INSERT INTO cancellation_policies (property_id, name, rules)
  SELECT prop.id, cp.name, cp.rules::jsonb
  FROM prop
  JOIN (VALUES
    ('Flexible 24h', '{"type":"FLEXIBLE","hours":24,"penalty":"one_night"}'),
    ('Non-refundable', '{"type":"NON_REFUNDABLE"}')
  ) AS cp(name, rules)
    ON true
  WHERE NOT EXISTS (
    SELECT 1 FROM cancellation_policies existing
    WHERE existing.property_id = prop.id
      AND existing.name = cp.name
      AND existing.deleted_at IS NULL
  )
  RETURNING id, name
), policies AS (
  SELECT cp.id, cp.name FROM cancellation_policies cp
  JOIN prop ON cp.property_id = prop.id
  WHERE cp.deleted_at IS NULL AND cp.name IN ('Flexible 24h', 'Non-refundable')
), rate_plans_ins AS (
  INSERT INTO rate_plans (
    property_id, code, name, is_refundable, includes_breakfast, cancellation_policy_id
  )
  SELECT prop.id,
         rp.code,
         rp.name,
         rp.is_refundable,
         rp.includes_breakfast,
         CASE
           WHEN rp.code = 'BAR' THEN (SELECT id FROM policies WHERE name = 'Flexible 24h' LIMIT 1)
           ELSE (SELECT id FROM policies WHERE name = 'Non-refundable' LIMIT 1)
         END
  FROM prop
  JOIN (VALUES
    ('BAR', 'Best Available Rate', true, true),
    ('ADV', 'Advance Saver', false, false)
  ) AS rp(code, name, is_refundable, includes_breakfast)
    ON true
  WHERE NOT EXISTS (
    SELECT 1 FROM rate_plans existing
    WHERE existing.property_id = prop.id
      AND existing.code = rp.code
      AND existing.deleted_at IS NULL
  )
  RETURNING id, code
), rate_plans_all AS (
  SELECT rp.id, rp.code FROM rate_plans rp
  JOIN prop ON rp.property_id = prop.id
  WHERE rp.deleted_at IS NULL AND rp.code IN ('BAR', 'ADV')
), room_types_all AS (
  SELECT rt.id, rt.code FROM room_types rt
  JOIN prop ON rt.property_id = prop.id
  WHERE rt.deleted_at IS NULL AND rt.code IN ('AB-STD', 'AB-DEL', 'AB-SUI')
), base_prices AS (
  SELECT rt.id AS room_type_id,
         CASE rt.code
           WHEN 'AB-STD' THEN 149
           WHEN 'AB-DEL' THEN 199
           WHEN 'AB-SUI' THEN 279
         END::numeric AS base_price
  FROM room_types_all rt
), dates AS (
  SELECT (CURRENT_DATE + gs)::date AS date
  FROM generate_series(0, 59) gs
)
INSERT INTO rate_plan_prices (rate_plan_id, room_type_id, date, price, currency)
SELECT rp.id,
       bp.room_type_id,
       d.date,
       CASE rp.code
         WHEN 'BAR' THEN bp.base_price
         WHEN 'ADV' THEN ROUND(bp.base_price * 0.85, 2)
       END AS price,
       'USD'
FROM rate_plans_all rp
CROSS JOIN base_prices bp
CROSS JOIN dates d
WHERE NOT EXISTS (
  SELECT 1 FROM rate_plan_prices existing
  WHERE existing.rate_plan_id = rp.id
    AND existing.room_type_id = bp.room_type_id
    AND existing.date = d.date
    AND existing.deleted_at IS NULL
);

WITH org AS (
  SELECT id FROM organizations WHERE name = 'Aurora Hospitality Group' AND deleted_at IS NULL
), prop AS (
  SELECT p.id FROM properties p
  JOIN org ON p.organization_id = org.id
  WHERE p.name = 'Aurora Bay Resort' AND p.deleted_at IS NULL
), room_types_all AS (
  SELECT rt.id, rt.code FROM room_types rt
  JOIN prop ON rt.property_id = prop.id
  WHERE rt.deleted_at IS NULL AND rt.code IN ('AB-STD', 'AB-DEL', 'AB-SUI')
)
INSERT INTO room_type_images (room_type_id, url, sort_order, is_primary)
SELECT rt.id, img.url, img.sort_order, img.is_primary
FROM room_types_all rt
JOIN (VALUES
  ('AB-STD', 'https://images.unsplash.com/photo-1501117716987-c8e1ecb210c7?auto=format&fit=crop&w=1600&q=80', 0, true),
  ('AB-STD', 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80', 1, false),
  ('AB-STD', 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1600&q=80', 2, false),
  ('AB-DEL', 'https://images.unsplash.com/photo-1505691723518-36a5ac3be353?auto=format&fit=crop&w=1600&q=80', 0, true),
  ('AB-DEL', 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1600&q=80', 1, false),
  ('AB-DEL', 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1600&q=80', 2, false),
  ('AB-SUI', 'https://images.unsplash.com/photo-1444201983204-c43cbd584d93?auto=format&fit=crop&w=1600&q=80', 0, true),
  ('AB-SUI', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1600&q=80', 1, false),
  ('AB-SUI', 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1600&q=80', 2, false)
) AS img(code, url, sort_order, is_primary)
  ON rt.code = img.code
WHERE NOT EXISTS (
  SELECT 1 FROM room_type_images i
  WHERE i.room_type_id = rt.id
    AND i.url = img.url
    AND i.deleted_at IS NULL
);

-- =====================================
-- Property: Cedar Ridge Lodge (Colorado)
-- =====================================
WITH org AS (
  SELECT id FROM organizations WHERE name = 'Aurora Hospitality Group' AND deleted_at IS NULL
), prop_ins AS (
  INSERT INTO properties (
    organization_id, name, timezone, currency,
    address_line1, city, state, postal_code, country
  )
  SELECT org.id, 'Cedar Ridge Lodge', 'America/Denver', 'USD',
         '450 Pinecrest Loop', 'Estes Park', 'CO', '80517', 'USA'
  FROM org
  WHERE NOT EXISTS (
    SELECT 1 FROM properties p
    WHERE p.organization_id = org.id
      AND p.name = 'Cedar Ridge Lodge'
      AND p.deleted_at IS NULL
  )
  RETURNING id
), prop AS (
  SELECT id FROM prop_ins
  UNION ALL
  SELECT p.id FROM properties p
  JOIN org ON p.organization_id = org.id
  WHERE p.name = 'Cedar Ridge Lodge' AND p.deleted_at IS NULL
), room_types_upsert AS (
  INSERT INTO room_types (
    property_id, code, name, max_adults, max_children, max_occupancy,
    base_description, default_bed_type
  )
  SELECT prop.id, rt.code, rt.name, rt.max_adults, rt.max_children, rt.max_occupancy,
         rt.base_description, rt.default_bed_type
  FROM prop
  JOIN (VALUES
    ('CR-STD', 'Forest Standard', 2, 1, 3, 'Warm lodge-inspired room with forest views.', 'Queen'),
    ('CR-KNG', 'Mountain King', 2, 2, 4, 'Corner king room with fireplace and balcony.', 'King'),
    ('CR-CAB', 'Alpine Cabin Suite', 4, 2, 6, 'Cabin-style suite with living room and dining nook.', 'King')
  ) AS rt(code, name, max_adults, max_children, max_occupancy, base_description, default_bed_type)
    ON true
  WHERE NOT EXISTS (
    SELECT 1 FROM room_types existing
    WHERE existing.property_id = prop.id
      AND existing.code = rt.code
      AND existing.deleted_at IS NULL
  )
  RETURNING id, code
), room_types_all AS (
  SELECT rt.id, rt.code
  FROM room_types rt
  JOIN prop ON rt.property_id = prop.id
  WHERE rt.deleted_at IS NULL AND rt.code IN ('CR-STD', 'CR-KNG', 'CR-CAB')
), room_numbers AS (
  SELECT rt.id AS room_type_id,
         CASE rt.code
           WHEN 'CR-STD' THEN 400
           WHEN 'CR-KNG' THEN 500
           WHEN 'CR-CAB' THEN 600
         END AS base_number,
         CASE rt.code
           WHEN 'CR-STD' THEN 12
           WHEN 'CR-KNG' THEN 8
           WHEN 'CR-CAB' THEN 4
         END AS room_count
  FROM room_types_all rt
)
INSERT INTO rooms (property_id, room_type_id, room_number, floor, housekeeping_zone, is_active)
SELECT prop.id,
       rn.room_type_id,
       (rn.base_number + gs)::text AS room_number,
       CASE
         WHEN rn.base_number < 500 THEN '4'
         WHEN rn.base_number < 600 THEN '5'
         ELSE '6'
       END AS floor,
       CASE
         WHEN rn.base_number < 500 THEN 'D'
         WHEN rn.base_number < 600 THEN 'E'
         ELSE 'F'
       END AS housekeeping_zone,
       true
FROM prop
JOIN room_numbers rn ON true
JOIN generate_series(1, rn.room_count) gs ON true
WHERE NOT EXISTS (
  SELECT 1 FROM rooms r
  WHERE r.property_id = prop.id
    AND r.room_number = (rn.base_number + gs)::text
    AND r.deleted_at IS NULL
);

WITH org AS (
  SELECT id FROM organizations WHERE name = 'Aurora Hospitality Group' AND deleted_at IS NULL
), prop AS (
  SELECT p.id FROM properties p
  JOIN org ON p.organization_id = org.id
  WHERE p.name = 'Cedar Ridge Lodge' AND p.deleted_at IS NULL
), cancel_policies AS (
  INSERT INTO cancellation_policies (property_id, name, rules)
  SELECT prop.id, cp.name, cp.rules::jsonb
  FROM prop
  JOIN (VALUES
    ('Flexible 24h', '{"type":"FLEXIBLE","hours":24,"penalty":"one_night"}'),
    ('Non-refundable', '{"type":"NON_REFUNDABLE"}')
  ) AS cp(name, rules)
    ON true
  WHERE NOT EXISTS (
    SELECT 1 FROM cancellation_policies existing
    WHERE existing.property_id = prop.id
      AND existing.name = cp.name
      AND existing.deleted_at IS NULL
  )
  RETURNING id, name
), policies AS (
  SELECT cp.id, cp.name FROM cancellation_policies cp
  JOIN prop ON cp.property_id = prop.id
  WHERE cp.deleted_at IS NULL AND cp.name IN ('Flexible 24h', 'Non-refundable')
), rate_plans_ins AS (
  INSERT INTO rate_plans (
    property_id, code, name, is_refundable, includes_breakfast, cancellation_policy_id
  )
  SELECT prop.id,
         rp.code,
         rp.name,
         rp.is_refundable,
         rp.includes_breakfast,
         CASE
           WHEN rp.code = 'BAR' THEN (SELECT id FROM policies WHERE name = 'Flexible 24h' LIMIT 1)
           ELSE (SELECT id FROM policies WHERE name = 'Non-refundable' LIMIT 1)
         END
  FROM prop
  JOIN (VALUES
    ('BAR', 'Best Available Rate', true, true),
    ('ADV', 'Advance Saver', false, false)
  ) AS rp(code, name, is_refundable, includes_breakfast)
    ON true
  WHERE NOT EXISTS (
    SELECT 1 FROM rate_plans existing
    WHERE existing.property_id = prop.id
      AND existing.code = rp.code
      AND existing.deleted_at IS NULL
  )
  RETURNING id, code
), rate_plans_all AS (
  SELECT rp.id, rp.code FROM rate_plans rp
  JOIN prop ON rp.property_id = prop.id
  WHERE rp.deleted_at IS NULL AND rp.code IN ('BAR', 'ADV')
), room_types_all AS (
  SELECT rt.id, rt.code FROM room_types rt
  JOIN prop ON rt.property_id = prop.id
  WHERE rt.deleted_at IS NULL AND rt.code IN ('CR-STD', 'CR-KNG', 'CR-CAB')
), base_prices AS (
  SELECT rt.id AS room_type_id,
         CASE rt.code
           WHEN 'CR-STD' THEN 129
           WHEN 'CR-KNG' THEN 179
           WHEN 'CR-CAB' THEN 259
         END::numeric AS base_price
  FROM room_types_all rt
), dates AS (
  SELECT (CURRENT_DATE + gs)::date AS date
  FROM generate_series(0, 59) gs
)
INSERT INTO rate_plan_prices (rate_plan_id, room_type_id, date, price, currency)
SELECT rp.id,
       bp.room_type_id,
       d.date,
       CASE rp.code
         WHEN 'BAR' THEN bp.base_price
         WHEN 'ADV' THEN ROUND(bp.base_price * 0.85, 2)
       END AS price,
       'USD'
FROM rate_plans_all rp
CROSS JOIN base_prices bp
CROSS JOIN dates d
WHERE NOT EXISTS (
  SELECT 1 FROM rate_plan_prices existing
  WHERE existing.rate_plan_id = rp.id
    AND existing.room_type_id = bp.room_type_id
    AND existing.date = d.date
    AND existing.deleted_at IS NULL
);

WITH org AS (
  SELECT id FROM organizations WHERE name = 'Aurora Hospitality Group' AND deleted_at IS NULL
), prop AS (
  SELECT p.id FROM properties p
  JOIN org ON p.organization_id = org.id
  WHERE p.name = 'Cedar Ridge Lodge' AND p.deleted_at IS NULL
), room_types_all AS (
  SELECT rt.id, rt.code FROM room_types rt
  JOIN prop ON rt.property_id = prop.id
  WHERE rt.deleted_at IS NULL AND rt.code IN ('CR-STD', 'CR-KNG', 'CR-CAB')
)
INSERT INTO room_type_images (room_type_id, url, sort_order, is_primary)
SELECT rt.id, img.url, img.sort_order, img.is_primary
FROM room_types_all rt
JOIN (VALUES
  ('CR-STD', 'https://images.unsplash.com/photo-1475776408506-9a5371e7a068?auto=format&fit=crop&w=1600&q=80', 0, true),
  ('CR-STD', 'https://images.unsplash.com/photo-1470246973918-29a93221c455?auto=format&fit=crop&w=1600&q=80', 1, false),
  ('CR-STD', 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80', 2, false),
  ('CR-KNG', 'https://images.unsplash.com/photo-1505691723518-36a5ac3be353?auto=format&fit=crop&w=1600&q=80', 0, true),
  ('CR-KNG', 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1600&q=80', 1, false),
  ('CR-KNG', 'https://images.unsplash.com/photo-1444201983204-c43cbd584d93?auto=format&fit=crop&w=1600&q=80', 2, false),
  ('CR-CAB', 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=80', 0, true),
  ('CR-CAB', 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80', 1, false),
  ('CR-CAB', 'https://images.unsplash.com/photo-1470770903676-69b98201ea1c?auto=format&fit=crop&w=1600&q=80', 2, false)
) AS img(code, url, sort_order, is_primary)
  ON rt.code = img.code
WHERE NOT EXISTS (
  SELECT 1 FROM room_type_images i
  WHERE i.room_type_id = rt.id
    AND i.url = img.url
    AND i.deleted_at IS NULL
);
