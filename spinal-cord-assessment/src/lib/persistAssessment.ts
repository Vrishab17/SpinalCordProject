import { supabase } from "./supabaseClient";

export type PersistMode = "draft" | "final";

/** Next numeric PK when the DB column has no SERIAL/default (avoids NOT NULL violations). */
async function allocateAssessmentId(): Promise<number> {
  const { data, error } = await supabase
    .from("Assessment")
    .select("assessment_id")
    .order("assessment_id", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  const max = data?.assessment_id;
  if (typeof max === "number" && Number.isFinite(max)) return max + 1;
  return 1;
}

/**
 * Creates or updates an `Assessment` row for this patient so it appears on the
 * dashboard and patient history. Draft saves also upsert `Draft Assessment` when
 * the schema supports it.
 */
export async function persistAssessmentToDatabase(opts: {
  patientId: number;
  staffId: number;
  mode: PersistMode;
  existingAssessmentId: number | null;
}): Promise<{ assessmentId: number }> {
  const isoNow = new Date().toISOString();
  const dateOnly = isoNow.slice(0, 10);
  const status = opts.mode === "draft" ? "DRAFT" : "FINALISED";

  if (opts.existingAssessmentId != null) {
    const id = opts.existingAssessmentId;
    const { error } = await supabase
      .from("Assessment")
      .update({
        status,
        assessment_date: dateOnly,
        STAFFstaff_id: opts.staffId,
      })
      .eq("assessment_id", id);

    if (error) throw new Error(error.message);

    if (opts.mode === "draft") {
      await supabase
        .from("Draft Assessment")
        .update({ last_saved_at: isoNow })
        .eq("ASSESSMENTassessment_id", id);
    } else {
      await supabase
        .from("Draft Assessment")
        .update({ is_current_draft: "false" })
        .eq("ASSESSMENTassessment_id", id);
    }

    return { assessmentId: id };
  }

  const assessment_id = await allocateAssessmentId();

  const { data, error } = await supabase
    .from("Assessment")
    .insert({
      assessment_id,
      PATIENTpatient_id: opts.patientId,
      assessment_date: dateOnly,
      status,
      STAFFstaff_id: opts.staffId,
      current_version: 1,
    })
    .select("assessment_id")
    .single();

  if (error) throw new Error(error.message);
  const assessmentId = data.assessment_id as number;

  if (opts.mode === "draft") {
    const { error: dErr } = await supabase.from("Draft Assessment").insert({
      ASSESSMENTassessment_id: assessmentId,
      last_saved_at: isoNow,
      is_current_draft: "true",
    });
    if (dErr) throw new Error(dErr.message);
  }

  return { assessmentId };
}

async function allocateExamId(): Promise<number> {
  const { data, error } = await supabase
    .from("Exam")
    .select("exam_id")
    .order("exam_id", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  const max = data?.exam_id;
  if (typeof max === "number" && Number.isFinite(max)) return max + 1;
  return 1;
}

async function allocateClassificationId(): Promise<number> {
  const { data, error } = await supabase
    .from("Classification Result")
    .select("classification_id")
    .order("classification_id", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  const max = data?.classification_id;
  if (typeof max === "number" && Number.isFinite(max)) return max + 1;
  return 1;
}

/**
 * Links a finalised assessment to an `Exam` and `Classification Result` so patient
 * history can show AIS (see `history/[patientId]/page.tsx`).
 */
export async function persistExamAndClassification(opts: {
  assessmentId: number;
  alsGrade: string;
}): Promise<void> {
  const examId = await allocateExamId();

  const { error: exErr } = await supabase.from("Exam").insert({
    exam_id: examId,
    ASSESSMENTassessment_id: opts.assessmentId,
  });
  if (exErr) throw new Error(exErr.message);

  const classification_id = await allocateClassificationId();

  const { error: crErr } = await supabase
    .from("Classification Result")
    .insert({
      classification_id,
      EXAMexam_id: examId,
      als_grade: opts.alsGrade,
    });
  if (crErr) throw new Error(crErr.message);
}
