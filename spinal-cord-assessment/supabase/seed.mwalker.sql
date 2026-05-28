-- Dev login: username mwalker / password password
-- Run in Supabase SQL editor after schema.sql (or on existing DB).
-- Password is bcrypt hash of the literal string "password" (cost 10).

INSERT INTO "Staff" (hpi_practitioner, role, department, is_active, email)
VALUES (
  'HPI-MWALKER',
  'Clinician',
  'Spinal Cord Service',
  'true',
  'mwalker@example.health.nz'
)
ON CONFLICT (hpi_practitioner) DO UPDATE SET
  is_active = EXCLUDED.is_active,
  email = EXCLUDED.email;

INSERT INTO "Staff Name" ("STAFFstaff_id", family_name, given_name, preferred_name, prefix)
SELECT staff_id, 'Walker', 'Morgan', 'Morgan', 'Dr'
FROM "Staff"
WHERE hpi_practitioner = 'HPI-MWALKER'
  AND NOT EXISTS (
    SELECT 1 FROM "Staff Name" sn WHERE sn."STAFFstaff_id" = "Staff".staff_id
  );

INSERT INTO "Staff Credentials" ("STAFFstaff_id", username, password_hash)
SELECT
  staff_id,
  'mwalker',
  '$2b$10$iMqklvTM/yPbWqxrVOpiHeq6Nzz.3/fz4Zx6H.pCLnM1p2voaEEJS'
FROM "Staff"
WHERE hpi_practitioner = 'HPI-MWALKER'
ON CONFLICT (username) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  "STAFFstaff_id" = EXCLUDED."STAFFstaff_id";
