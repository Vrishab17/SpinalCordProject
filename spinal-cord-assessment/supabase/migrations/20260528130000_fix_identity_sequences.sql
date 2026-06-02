-- Resync identity sequences after manual/seed inserts with explicit IDs.

SELECT setval(
  pg_get_serial_sequence('"Assessment Version"', 'version_id'),
  COALESCE((SELECT MAX(version_id) FROM "Assessment Version"), 0) + 1,
  false
);

SELECT setval(
  pg_get_serial_sequence('"Draft Assessment"', 'draft_id'),
  COALESCE((SELECT MAX(draft_id) FROM "Draft Assessment"), 0) + 1,
  false
);

SELECT setval(
  pg_get_serial_sequence('"Final Assessment"', 'final_id'),
  COALESCE((SELECT MAX(final_id) FROM "Final Assessment"), 0) + 1,
  false
);

SELECT setval(
  pg_get_serial_sequence('"Exam"', 'exam_id'),
  COALESCE((SELECT MAX(exam_id) FROM "Exam"), 0) + 1,
  false
);

SELECT setval(
  pg_get_serial_sequence('"Patient Injury"', 'injury_id'),
  COALESCE((SELECT MAX(injury_id) FROM "Patient Injury"), 0) + 1,
  false
);

SELECT setval(
  pg_get_serial_sequence('"Audit Log"', 'audit_id'),
  COALESCE((SELECT MAX(audit_id) FROM "Audit Log"), 0) + 1,
  false
);

SELECT setval(
  pg_get_serial_sequence('"Exam Side"', 'exam_side_id'),
  COALESCE((SELECT MAX(exam_side_id) FROM "Exam Side"), 0) + 1,
  false
);

SELECT setval(
  pg_get_serial_sequence('"Motor Score"', 'motor_score_id'),
  COALESCE((SELECT MAX(motor_score_id) FROM "Motor Score"), 0) + 1,
  false
);

SELECT setval(
  pg_get_serial_sequence('"Light Touch Score"', 'lt_score_id'),
  COALESCE((SELECT MAX(lt_score_id) FROM "Light Touch Score"), 0) + 1,
  false
);

SELECT setval(
  pg_get_serial_sequence('"Pin Prick Score"', 'pp_score_id'),
  COALESCE((SELECT MAX(pp_score_id) FROM "Pin Prick Score"), 0) + 1,
  false
);

SELECT setval(
  pg_get_serial_sequence('"Classification Result"', 'classification_id'),
  COALESCE((SELECT MAX(classification_id) FROM "Classification Result"), 0) + 1,
  false
);

SELECT setval(
  pg_get_serial_sequence('"Assessment Totals"', 'totals_id'),
  COALESCE((SELECT MAX(totals_id) FROM "Assessment Totals"), 0) + 1,
  false
);
