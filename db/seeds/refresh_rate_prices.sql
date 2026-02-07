-- Refresh rate plan prices for the next 60 days from today
-- This script is idempotent - safe to run multiple times

-- =====================================
-- Aurora Bay Resort Prices
-- =====================================
WITH prop AS (
  SELECT p.id FROM properties p
  WHERE p.name = 'Aurora Bay Resort' AND p.deleted_at IS NULL
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

-- =====================================
-- Cedar Ridge Lodge Prices
-- =====================================
WITH prop AS (
  SELECT p.id FROM properties p
  WHERE p.name = 'Cedar Ridge Lodge' AND p.deleted_at IS NULL
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

-- Report what was added
SELECT 
  p.name as property,
  rp.code as rate_plan,
  rt.code as room_type,
  COUNT(*) as prices_count,
  MIN(rpp.date) as from_date,
  MAX(rpp.date) as to_date
FROM rate_plan_prices rpp
JOIN rate_plans rp ON rpp.rate_plan_id = rp.id
JOIN room_types rt ON rpp.room_type_id = rt.id
JOIN properties p ON rp.property_id = p.id
WHERE rpp.deleted_at IS NULL
  AND rpp.date >= CURRENT_DATE
GROUP BY p.name, rp.code, rt.code
ORDER BY p.name, rp.code, rt.code;
