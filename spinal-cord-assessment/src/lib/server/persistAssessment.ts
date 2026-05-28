import type { UiExam } from "@/components/assessment/AssessmentForm";
import {
  type AssessmentId,
  generateRandomLlnnAssessmentId,
} from "@/lib/assessmentId";
import { resolveAssessmentDatesForSave } from "@/lib/assessmentDates";
import type { SupabaseClient } from "@supabase/supabase-js";
import { writeAuditLog } from "./auditLog";
import { persistClassificationOnServer } from "./persistClassification";
import { persistExamDataOnServer } from "./persistExam";
import { upsertPatientInjury } from "./patientInjury";

export type PersistMode = "draft" | "final";

const ASSESSMENT_ID_ALLOCATION_ATTEMPTS = 50;

async function allocateAssessmentId(
  db: SupabaseClient
): Promise<AssessmentId> {
  for (let attempt = 0; attempt < ASSESSMENT_ID_ALLOCATION_ATTEMPTS; attempt++) {
    const candidate = generateRandomLlnnAssessmentId();
    const { data, error } = await db
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

/** Next version from history (avoids collisions if `current_version` lags). */
async function nextAssessmentVersionNumber(
  db: SupabaseClient,
  assessmentId: AssessmentId,
  currentVersionOnRow: number
): Promise<number> {
  const { data, error } = await db
    .from("Assessment Version")
    .select("version_number")
    .eq("ASSESSMENTassessment_id", assessmentId)
    .order("version_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);

  const maxInHistory = Number(data?.version_number ?? 0);
  return Math.max(maxInHistory, currentVersionOnRow) + 1;
}

async function recordAssessmentVersion(
  db: SupabaseClient,
  opts: {
    assessmentId: AssessmentId;
    staffId: number;
    versionNumber: number;
    changeReason: string;
    isoNow: string;
  }
): Promise<void> {
  const { error } = await db.from("Assessment Version").insert({
    ASSESSMENTassessment_id: opts.assessmentId,
    STAFFstaff_id: opts.staffId,
    version_number: opts.versionNumber,
    change_reason: opts.changeReason,
    created_at: opts.isoNow,
  });
  if (error) {
    throw new Error(`Assessment Version insert failed: ${error.message}`);
  }

  await writeAuditLog(db, {
    entityType: "Assessment",
    entityId: opts.assessmentId,
    action: "assessment.version",
    staffId: opts.staffId,
    details: {
      version_number: opts.versionNumber,
      change_reason: opts.changeReason,
    },
  });
}

async function upsertDraftRow(
  db: SupabaseClient,
  opts: {
    assessmentId: AssessmentId;
    staffId: number;
    mode: PersistMode;
    isoNow: string;
  }
): Promise<void> {
  const { data: draftRow } = await db
    .from("Draft Assessment")
    .select("draft_id")
    .eq("ASSESSMENTassessment_id", opts.assessmentId)
    .maybeSingle();

  if (opts.mode === "draft") {
    if (draftRow?.draft_id != null) {
      const { error } = await db
        .from("Draft Assessment")
        .update({
          last_saved_at: opts.isoNow,
          is_current_draft: "true",
          STAFFstaff_id: opts.staffId,
        })
        .eq("ASSESSMENTassessment_id", opts.assessmentId);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await db.from("Draft Assessment").insert({
        ASSESSMENTassessment_id: opts.assessmentId,
        last_saved_at: opts.isoNow,
        is_current_draft: "true",
        STAFFstaff_id: opts.staffId,
        created_at: opts.isoNow,
      });
      if (error) throw new Error(error.message);
    }
    return;
  }

  const { error } = await db
    .from("Draft Assessment")
    .update({ is_current_draft: "false" })
    .eq("ASSESSMENTassessment_id", opts.assessmentId);
  if (error) throw new Error(error.message);
}

async function upsertFinalRow(
  db: SupabaseClient,
  opts: {
    assessmentId: AssessmentId;
    staffId: number;
    versionNumber: number;
    isoNow: string;
  }
): Promise<void> {
  const { data: existing } = await db
    .from("Final Assessment")
    .select("final_id")
    .eq("ASSESSMENTassessment_id", opts.assessmentId)
    .maybeSingle();

  if (existing?.final_id != null) {
    const { error } = await db
      .from("Final Assessment")
      .update({
        is_current_final: "true",
        finalised_at: opts.isoNow,
        STAFFstaff_id: opts.staffId,
        version_number: opts.versionNumber,
      })
      .eq("ASSESSMENTassessment_id", opts.assessmentId);
    if (error) throw new Error(error.message);
    return;
  }

  const { error } = await db.from("Final Assessment").insert({
    ASSESSMENTassessment_id: opts.assessmentId,
    STAFFstaff_id: opts.staffId,
    version_number: opts.versionNumber,
    is_current_final: "true",
    finalised_at: opts.isoNow,
    created_at: opts.isoNow,
  });
  if (error) throw new Error(error.message);
}

export async function persistAssessmentOnServer(
  db: SupabaseClient,
  opts: {
    staffId: number;
    patientId: number;
    mode: PersistMode;
    existingAssessmentId: AssessmentId | null;
    exam: UiExam;
    comments: string;
    injuryDate?: string | null;
    reviewDate?: string | null;
    classificationResult?: unknown;
  }
): Promise<{
  assessmentId: AssessmentId;
  createdAt: string | null;
  updatedAt: string;
  versionNumber: number;
}> {
  const isoNow = new Date().toISOString();
  const dateOnly = isoNow.slice(0, 10);
  const status = opts.mode === "draft" ? "DRAFT" : "FINALISED";
  const { injury_date, review_date } = resolveAssessmentDatesForSave({
    injuryDate: opts.injuryDate,
    reviewDate: opts.reviewDate,
  });

  await upsertPatientInjury(db, {
    patientId: opts.patientId,
    staffId: opts.staffId,
    injury: {
      injuryDate: injury_date,
      reviewDate: review_date,
      injuryCause: null,
      notes: null,
    },
  });

  const versionReason =
    opts.mode === "final" ? "FINALISED" : "DRAFT_SAVE";

  if (opts.existingAssessmentId != null) {
    const id = opts.existingAssessmentId;

    const { data: existing, error: loadErr } = await db
      .from("Assessment")
      .select("status, created_at, current_version")
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

    const prevVersion = Number(existing?.current_version ?? 0);
    const versionNumber = await nextAssessmentVersionNumber(
      db,
      id,
      prevVersion
    );

    const { error } = await db
      .from("Assessment")
      .update({
        status,
        assessment_date: dateOnly,
        STAFFstaff_id: opts.staffId,
        updated_at: isoNow,
        injury_date,
        review_date,
        current_version: versionNumber,
      })
      .eq("assessment_id", id);

    if (error) throw new Error(error.message);

    await recordAssessmentVersion(db, {
      assessmentId: id,
      staffId: opts.staffId,
      versionNumber,
      changeReason: versionReason,
      isoNow,
    });

    await upsertDraftRow(db, {
      assessmentId: id,
      staffId: opts.staffId,
      mode: opts.mode,
      isoNow,
    });

    if (opts.mode === "final") {
      await upsertFinalRow(db, {
        assessmentId: id,
        staffId: opts.staffId,
        versionNumber,
        isoNow,
      });
    }

    await persistExamDataOnServer(db, {
      assessmentId: id,
      exam: opts.exam,
      comments: opts.comments,
      versionNumber,
    });

    if (opts.classificationResult) {
      await persistClassificationOnServer(db, {
        assessmentId: id,
        result: opts.classificationResult,
      });
    }

    await writeAuditLog(db, {
      entityType: "Assessment",
      entityId: id,
      action: opts.mode === "final" ? "assessment.finalise" : "assessment.update",
      staffId: opts.staffId,
      details: { version_number: versionNumber, status },
    });

    return {
      assessmentId: id,
      createdAt: (existing?.created_at as string | null) ?? null,
      updatedAt: isoNow,
      versionNumber,
    };
  }

  const assessment_id = await allocateAssessmentId(db);
  const versionNumber = 1;

  const { data, error } = await db
    .from("Assessment")
    .insert({
      assessment_id,
      PATIENTpatient_id: opts.patientId,
      assessment_date: dateOnly,
      status,
      STAFFstaff_id: opts.staffId,
      current_version: versionNumber,
      injury_date,
      review_date,
      created_at: isoNow,
      updated_at: isoNow,
    })
    .select("assessment_id, created_at, updated_at")
    .single();

  if (error) throw new Error(error.message);

  await recordAssessmentVersion(db, {
    assessmentId: assessment_id,
    staffId: opts.staffId,
    versionNumber,
    changeReason: "INITIAL_CREATE",
    isoNow,
  });

  await upsertDraftRow(db, {
    assessmentId: assessment_id,
    staffId: opts.staffId,
    mode: opts.mode,
    isoNow,
  });

  if (opts.mode === "final") {
    await upsertFinalRow(db, {
      assessmentId: assessment_id,
      staffId: opts.staffId,
      versionNumber,
      isoNow,
    });
  }

  await persistExamDataOnServer(db, {
    assessmentId: assessment_id,
    exam: opts.exam,
    comments: opts.comments,
    versionNumber,
  });

  if (opts.classificationResult) {
    await persistClassificationOnServer(db, {
      assessmentId: assessment_id,
      result: opts.classificationResult,
    });
  }

  await writeAuditLog(db, {
    entityType: "Assessment",
    entityId: assessment_id,
    action: "assessment.create",
    staffId: opts.staffId,
    details: { version_number: versionNumber, status },
  });

  return {
    assessmentId: assessment_id,
    createdAt: (data.created_at as string | null) ?? isoNow,
    updatedAt: (data.updated_at as string) ?? isoNow,
    versionNumber,
  };
}
