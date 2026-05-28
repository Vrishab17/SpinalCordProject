import type { UiExam } from "@/components/assessment/AssessmentForm";
import {
  type AssessmentId,
  generateRandomLlnnAssessmentId,
} from "./assessmentId";
import { persistExamData } from "./assessmentExamData";
import {
  clearPatientInjuryContext,
  formatInjuryNotes,
  readPatientInjuryContext,
} from "./patientInjuryContext";
import { supabase } from "./supabaseClient";

export { persistClassificationAndTotals } from "./classificationPersistence";

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

async function allocateFinalId(): Promise<number> {
  const { data, error } = await supabase
    .from("Final Assessment")
    .select("final_id")
    .order("final_id", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  const max = data?.final_id;
  if (typeof max === "number" && Number.isFinite(max)) return max + 1;
  return 1;
}

function injuryDateForNewAssessment(patientNhi: string | null): string | null {
  if (!patientNhi) return null;
  const ctx = readPatientInjuryContext(patientNhi);
  const raw = ctx?.dateOfInjury?.trim();
  if (!raw) return null;
  return raw.length >= 10 ? raw.slice(0, 10) : raw;
}

async function upsertDraftAssessmentRow(opts: {
  assessmentId: AssessmentId;
  staffId: number;
  mode: PersistMode;
  patientNhi: string | null;
  isoNow: string;
}): Promise<void> {
  const injuryCtx =
    opts.patientNhi != null ? readPatientInjuryContext(opts.patientNhi) : null;
  const injuryNotes = injuryCtx ? formatInjuryNotes(injuryCtx) : null;

  const { data: draftRow } = await supabase
    .from("Draft Assessment")
    .select("draft_id")
    .eq("ASSESSMENTassessment_id", opts.assessmentId)
    .maybeSingle();

  if (opts.mode === "draft") {
    if (draftRow) {
      const { error } = await supabase
        .from("Draft Assessment")
        .update({
          last_saved_at: opts.isoNow,
          is_current_draft: "true",
          STAFFstaff_id: opts.staffId,
          ...(injuryNotes ? { notes: injuryNotes } : {}),
        })
        .eq("ASSESSMENTassessment_id", opts.assessmentId);
      if (error) throw new Error(error.message);
    } else {
      const draft_id = await allocateDraftId();
      const { error } = await supabase.from("Draft Assessment").insert({
        draft_id,
        ASSESSMENTassessment_id: opts.assessmentId,
        last_saved_at: opts.isoNow,
        is_current_draft: "true",
        STAFFstaff_id: opts.staffId,
        notes: injuryNotes,
      });
      if (error) throw new Error(error.message);
    }
    return;
  }

  await supabase
    .from("Draft Assessment")
    .update({ is_current_draft: "false" })
    .eq("ASSESSMENTassessment_id", opts.assessmentId);
}

async function upsertFinalAssessmentRow(opts: {
  assessmentId: AssessmentId;
  staffId: number;
  isoNow: string;
  patientNhi: string | null;
}): Promise<void> {
  const injuryCtx =
    opts.patientNhi != null ? readPatientInjuryContext(opts.patientNhi) : null;
  const injuryNotes = injuryCtx ? formatInjuryNotes(injuryCtx) : null;

  const { data: existing } = await supabase
    .from("Final Assessment")
    .select("final_id")
    .eq("ASSESSMENTassessment_id", opts.assessmentId)
    .maybeSingle();

  if (existing?.final_id != null) {
    const { error } = await supabase
      .from("Final Assessment")
      .update({
        is_current_final: "true",
        finalised_at: opts.isoNow,
        STAFFstaff_id: opts.staffId,
        notes: injuryNotes,
      })
      .eq("ASSESSMENTassessment_id", opts.assessmentId);
    if (error) throw new Error(error.message);
    return;
  }

  const final_id = await allocateFinalId();
  const { error } = await supabase.from("Final Assessment").insert({
    final_id,
    ASSESSMENTassessment_id: opts.assessmentId,
    STAFFstaff_id: opts.staffId,
    version_number: 1,
    is_current_final: "true",
    finalised_at: opts.isoNow,
    notes: injuryNotes,
  });
  if (error) throw new Error(error.message);
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
  patientNhi?: string | null;
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

    await upsertDraftAssessmentRow({
      assessmentId: id,
      staffId: opts.staffId,
      mode: opts.mode,
      patientNhi: opts.patientNhi ?? null,
      isoNow,
    });

    if (opts.mode === "final") {
      await upsertFinalAssessmentRow({
        assessmentId: id,
        staffId: opts.staffId,
        isoNow,
        patientNhi: opts.patientNhi ?? null,
      });
      if (opts.patientNhi) clearPatientInjuryContext(opts.patientNhi);
    }

    await persistExamData({
      assessmentId: id,
      exam: opts.exam,
      comments: opts.comments,
    });

    return { assessmentId: id };
  }

  const assessment_id = await allocateAssessmentId();
  const injuryDate = injuryDateForNewAssessment(opts.patientNhi ?? null);

  const { data, error } = await supabase
    .from("Assessment")
    .insert({
      assessment_id,
      PATIENTpatient_id: opts.patientId,
      assessment_date: dateOnly,
      status,
      STAFFstaff_id: opts.staffId,
      current_version: 1,
      ...(injuryDate ? { injury_date: injuryDate } : {}),
    })
    .select("assessment_id")
    .single();

  if (error) throw new Error(error.message);
  const assessmentId = data.assessment_id as AssessmentId;

  await upsertDraftAssessmentRow({
    assessmentId,
    staffId: opts.staffId,
    mode: opts.mode,
    patientNhi: opts.patientNhi ?? null,
    isoNow,
  });

  if (opts.mode === "final") {
    await upsertFinalAssessmentRow({
      assessmentId,
      staffId: opts.staffId,
      isoNow,
      patientNhi: opts.patientNhi ?? null,
    });
    if (opts.patientNhi) clearPatientInjuryContext(opts.patientNhi);
  }

  await persistExamData({
    assessmentId,
    exam: opts.exam,
    comments: opts.comments,
  });

  return { assessmentId };
}
