-- Live DB was missing default/sequence on lt_score_id (bulk inserts failed NOT NULL).

CREATE SEQUENCE IF NOT EXISTS "Light Touch Score_lt_score_id_seq";

SELECT setval(
  '"Light Touch Score_lt_score_id_seq"',
  COALESCE((SELECT MAX(lt_score_id) FROM "Light Touch Score"), 0) + 1,
  false
);

ALTER TABLE "Light Touch Score"
  ALTER COLUMN lt_score_id SET DEFAULT nextval('"Light Touch Score_lt_score_id_seq"');

ALTER SEQUENCE "Light Touch Score_lt_score_id_seq"
  OWNED BY "Light Touch Score".lt_score_id;
