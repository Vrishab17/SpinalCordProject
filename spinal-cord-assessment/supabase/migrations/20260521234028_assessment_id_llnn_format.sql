-- Migrate assessment_id from sequential bigint to random LLNN (e.g. AB12).
-- Safe to run on a database that still has numeric assessment_id values.
-- Skip if this migration was already applied (assessment_id is already char(4)).

CREATE TABLE _assessment_id_migration (
  old_id bigint PRIMARY KEY,
  new_id char(4) NOT NULL UNIQUE
);

DO $$
DECLARE
  r RECORD;
  new_code char(4);
  used text[] := ARRAY[]::text[];
  letters constant text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  l1 int;
  l2 int;
  found boolean;
BEGIN
  FOR r IN SELECT assessment_id FROM "Assessment" ORDER BY assessment_id
  LOOP
    found := false;
    WHILE NOT found LOOP
      l1 := 1 + floor(random() * 26)::int;
      l2 := 1 + floor(random() * 26)::int;
      new_code :=
        substr(letters, l1, 1) ||
        substr(letters, l2, 1) ||
        chr(48 + floor(random() * 10)::int) ||
        chr(48 + floor(random() * 10)::int);
      IF NOT (new_code = ANY(used)) THEN
        used := array_append(used, new_code);
        INSERT INTO _assessment_id_migration (old_id, new_id) VALUES (r.assessment_id, new_code);
        found := true;
      END IF;
    END LOOP;
  END LOOP;
END $$;

ALTER TABLE "Assessment Version" DROP CONSTRAINT IF EXISTS "Assessment Version_ASSESSMENTassessment_id_fkey";
ALTER TABLE "Draft Assessment" DROP CONSTRAINT IF EXISTS "Draft Assessment_ASSESSMENTassessment_id_fkey";
ALTER TABLE "Exam" DROP CONSTRAINT IF EXISTS "Exam_ASSESSMENTassessment_id_fkey";
ALTER TABLE "Final Assessment" DROP CONSTRAINT IF EXISTS "Final Assessment_ASSESSMENTassessment_id_fkey";

ALTER TABLE "Exam" ADD COLUMN "_new_asmt_id" char(4);
UPDATE "Exam" e
SET "_new_asmt_id" = m.new_id
FROM _assessment_id_migration m
WHERE e."ASSESSMENTassessment_id" = m.old_id;
ALTER TABLE "Exam" DROP COLUMN "ASSESSMENTassessment_id";
ALTER TABLE "Exam" RENAME COLUMN "_new_asmt_id" TO "ASSESSMENTassessment_id";
ALTER TABLE "Exam" ALTER COLUMN "ASSESSMENTassessment_id" SET NOT NULL;

ALTER TABLE "Draft Assessment" ADD COLUMN "_new_asmt_id" char(4);
UPDATE "Draft Assessment" d
SET "_new_asmt_id" = m.new_id
FROM _assessment_id_migration m
WHERE d."ASSESSMENTassessment_id" = m.old_id;
ALTER TABLE "Draft Assessment" DROP COLUMN "ASSESSMENTassessment_id";
ALTER TABLE "Draft Assessment" RENAME COLUMN "_new_asmt_id" TO "ASSESSMENTassessment_id";
ALTER TABLE "Draft Assessment" ALTER COLUMN "ASSESSMENTassessment_id" SET NOT NULL;

ALTER TABLE "Assessment Version" ADD COLUMN "_new_asmt_id" char(4);
UPDATE "Assessment Version" v
SET "_new_asmt_id" = m.new_id
FROM _assessment_id_migration m
WHERE v."ASSESSMENTassessment_id" = m.old_id;
ALTER TABLE "Assessment Version" DROP COLUMN "ASSESSMENTassessment_id";
ALTER TABLE "Assessment Version" RENAME COLUMN "_new_asmt_id" TO "ASSESSMENTassessment_id";
ALTER TABLE "Assessment Version" ALTER COLUMN "ASSESSMENTassessment_id" SET NOT NULL;

ALTER TABLE "Final Assessment" ADD COLUMN "_new_asmt_id" char(4);
UPDATE "Final Assessment" f
SET "_new_asmt_id" = m.new_id
FROM _assessment_id_migration m
WHERE f."ASSESSMENTassessment_id" = m.old_id;
ALTER TABLE "Final Assessment" DROP COLUMN "ASSESSMENTassessment_id";
ALTER TABLE "Final Assessment" RENAME COLUMN "_new_asmt_id" TO "ASSESSMENTassessment_id";
ALTER TABLE "Final Assessment" ALTER COLUMN "ASSESSMENTassessment_id" SET NOT NULL;

ALTER TABLE "Assessment" ADD COLUMN "_new_id" char(4);
UPDATE "Assessment" a
SET "_new_id" = m.new_id
FROM _assessment_id_migration m
WHERE a.assessment_id = m.old_id;
ALTER TABLE "Assessment" DROP CONSTRAINT IF EXISTS "Assessment_pkey";
ALTER TABLE "Assessment" DROP COLUMN assessment_id;
ALTER TABLE "Assessment" RENAME COLUMN "_new_id" TO assessment_id;
ALTER TABLE "Assessment" ALTER COLUMN assessment_id SET NOT NULL;
ALTER TABLE "Assessment" ADD PRIMARY KEY (assessment_id);
ALTER TABLE "Assessment"
  ADD CONSTRAINT assessment_id_llnn_format
  CHECK (assessment_id ~ '^[A-Z]{2}[0-9]{2}$');

ALTER TABLE "Exam"
  ADD CONSTRAINT "Exam_ASSESSMENTassessment_id_fkey"
  FOREIGN KEY ("ASSESSMENTassessment_id") REFERENCES "Assessment"(assessment_id);
ALTER TABLE "Draft Assessment"
  ADD CONSTRAINT "Draft Assessment_ASSESSMENTassessment_id_fkey"
  FOREIGN KEY ("ASSESSMENTassessment_id") REFERENCES "Assessment"(assessment_id);
ALTER TABLE "Assessment Version"
  ADD CONSTRAINT "Assessment Version_ASSESSMENTassessment_id_fkey"
  FOREIGN KEY ("ASSESSMENTassessment_id") REFERENCES "Assessment"(assessment_id);
ALTER TABLE "Final Assessment"
  ADD CONSTRAINT "Final Assessment_ASSESSMENTassessment_id_fkey"
  FOREIGN KEY ("ASSESSMENTassessment_id") REFERENCES "Assessment"(assessment_id);

DROP TABLE _assessment_id_migration;
