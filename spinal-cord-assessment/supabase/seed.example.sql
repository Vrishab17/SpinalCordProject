-- Example seed data for local / dev setup (optional).
-- Run AFTER schema.sql on an empty database.
-- Edit values, then run in the Supabase SQL editor.

-- Staff
INSERT INTO "Staff" (hpi_practitioner, role, department, is_active, email)
VALUES ('HPI000000', 'Clinician', 'Spinal Cord Service', 'true', 'clinician@example.health.nz');

INSERT INTO "Staff Name" ("STAFFstaff_id", family_name, given_name, preferred_name, prefix)
SELECT staff_id, 'Example', 'Alex', 'Alex', 'Dr'
FROM "Staff" WHERE hpi_practitioner = 'HPI000000';

-- Credentials: use a bcrypt hash (never store plain text).
-- Generate via POST /api/hash-existing-passwords or an external bcrypt tool.
-- INSERT INTO "Staff Credentials" ("STAFFstaff_id", username, password_hash)
-- SELECT staff_id, 'alex.example', '$2a$10$REPLACE_WITH_BCRYPT_HASH'
-- FROM "Staff" WHERE hpi_practitioner = 'HPI000000';

-- Patient
INSERT INTO "Patient" (nhi_number, date_of_birth, gender, ethnicity, is_active)
VALUES ('ABC1234', '1985-06-15', 'Female', 'NZ European', 'true');

INSERT INTO "Patient Name" ("PATIENTpatient_id", family_name, given_name)
SELECT patient_id, 'Patient', 'Test'
FROM "Patient" WHERE nhi_number = 'ABC1234';

-- Assessment IDs must be LLNN (e.g. AB12). The app generates them on save.
