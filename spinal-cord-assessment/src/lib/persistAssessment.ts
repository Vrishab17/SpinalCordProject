import type { UiExam } from "@/components/assessment/AssessmentForm";
import {
  type AssessmentId,
  generateRandomLlnnAssessmentId,
} from "./assessmentId";
import { persistExamData } from "./assessmentExamData";
import { supabase } from "./supabaseClient";

export type PersistMode = "draft" | "final";

const ASSESSMENT_ID_ALLOCATION_ATTEMPTS = 50;

/** Random LLNN PK when the DB column has no SERIAL/default (avoids NOT NULL violations). */
async function allocateAssessmentId(): Promise<AssessmentId> {
  for (let attempt = 0; attempt < ASSESSMENT_ID_ALLOCATION_ATTEMPTS; attempt++) {
    const candidate = generateRandomLlnnAssessmentId();
    const { data, error } = await supabase
      .from("Assessment")
      .select("assessment_id")
      .eq("assessment_id", candidate)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) return candidate;
  }

  throw new Error(
    "Could not allocate a unique assessment ID. Please try again."
  );
}

async function allocateDraftId(): Promise<number> {
  const { data, error } = await supabase
    .from("Draft Assessment")
    .select("draft_id")
    .order("draft_id", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  const max = data?.draft_id;
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
 * Creates or updates an `Assessment` row for this patient so it appears on the
 * dashboard and patient history. Persists exam scores and upserts `Draft Assessment`.
 */
export async function persistAssessmentToDatabase(opts: {
  patientId: number;
  staffId: number;
  mode: PersistMode;
  existingAssessmentId: AssessmentId | null;
  exam: UiExam;
  comments: string;
}): Promise<{ assessmentId: AssessmentId }> {
  const isoNow = new Date().toISOString();
  const dateOnly = isoNow.slice(0, 10);
  const status = opts.mode === "draft" ? "DRAFT" : "FINALISED";

  if (opts.existingAssessmentId != null) {
    const id = opts.existingAssessmentId;

    const { data: existing, error: loadErr } = await supabase
      .from("Assessment")
      .select("status")
      .eq("assessment_id", id)
      .maybeSingle();

    if (loadErr) throw new Error(loadErr.message);
    const existingStatus = String(existing?.status ?? "").toUpperCase();
    if (
      existingStatus === "FINALISED" ||
      existingStatus === "FINALIZED"
    ) {
      throw new Error("This assessment is finalised and cannot be edited.");
    }

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
      const { data: draftRow } = await supabase
        .from("Draft Assessment")
        .select("draft_id")
        .eq("ASSESSMENTassessment_id", id)
        .maybeSingle();

      if (draftRow) {
        await supabase
          .from("Draft Assessment")
          .update({
            last_saved_at: isoNow,
            is_current_draft: "true",
            STAFFstaff_id: opts.staffId,
          })
          .eq("ASSESSMENTassessment_id", id);
      } else {
        const draft_id = await allocateDraftId();
        await supabase.from("Draft Assessment").insert({
          draft_id,
          ASSESSMENTassessment_id: id,
          last_saved_at: isoNow,
          is_current_draft: "true",
          STAFFstaff_id: opts.staffId,
        });
      }
    } else {
      await supabase
        .from("Draft Assessment")
        .update({ is_current_draft: "false" })
        .eq("ASSESSMENTassessment_id", id);
    }

    await persistExamData({
      assessmentId: id,
      exam: opts.exam,
      comments: opts.comments,
    });

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
  const assessmentId = data.assessment_id as AssessmentId;

  if (opts.mode === "draft") {
    const draft_id = await allocateDraftId();
    const { error: dErr } = await supabase.from("Draft Assessment").insert({
      draft_id,
      ASSESSMENTassessment_id: assessmentId,
      last_saved_at: isoNow,
      is_current_draft: "true",
      STAFFstaff_id: opts.staffId,
    });
    if (dErr) throw new Error(dErr.message);
  }

  await persistExamData({
    assessmentId,
    exam: opts.exam,
    comments: opts.comments,
  });

  return { assessmentId };
}

/**
 * Links a finalised assessment's exam to a `Classification Result` so patient
 * history can show AIS (see `history/[patientId]/page.tsx`).
 */
export async function persistExamAndClassification(opts: {
  assessmentId: AssessmentId;
  alsGrade: string;
}): Promise<void> {
  const { data: examRow, error: exFindErr } = await supabase
    .from("Exam")
    .select("exam_id")
    .eq("ASSESSMENTassessment_id", opts.assessmentId)
    .order("exam_id", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (exFindErr) throw new Error(exFindErr.message);
  if (!examRow?.exam_id) {
    throw new Error("Exam data missing for this assessment.");
  }

  const examId = examRow.exam_id as number;

  const { data: existingClass } = await supabase
    .from("Classification Result")
    .select("classification_id")
    .eq("EXAMexam_id", examId)
    .maybeSingle();

  if (existingClass?.classification_id != null) {
    const { error: crErr } = await supabase
      .from("Classification Result")
      .update({ als_grade: opts.alsGrade })
      .eq("classification_id", existingClass.classification_id);
    if (crErr) throw new Error(crErr.message);
    return;
  }

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
