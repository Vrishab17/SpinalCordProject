import type { SupabaseClient } from "@supabase/supabase-js";
import {
  defaultReviewDateFromInjury,
  toDateOnly,
} from "@/lib/assessmentDatesCore";
import { writeAuditLog } from "./auditLog";

export type PatientInjuryInput = {
  injuryDate?: string | null;
  reviewDate?: string | null;
  injuryCause?: string | null;
  notes?: string | null;
};

export async function upsertPatientInjury(
  db: SupabaseClient,
  opts: {
    patientId: number;
    staffId: number;
    injury: PatientInjuryInput;
  }
): Promise<void> {
  const isoNow = new Date().toISOString();

  const { data: existing } = await db
    .from("Patient Injury")
    .select("injury_id, injury_date, injury_cause, notes, review_date")
    .eq("PATIENTpatient_id", opts.patientId)
    .maybeSingle();

  const injury_date =
    opts.injury.injuryDate !== undefined
      ? toDateOnly(opts.injury.injuryDate)
      : toDateOnly(existing?.injury_date as string | null);
  let review_date =
    opts.injury.reviewDate !== undefined
      ? toDateOnly(opts.injury.reviewDate)
      : toDateOnly(existing?.review_date as string | null);
  if (!review_date && injury_date) {
    review_date = defaultReviewDateFromInjury(injury_date);
  }

  const injury_cause =
    opts.injury.injuryCause !== undefined
      ? opts.injury.injuryCause?.trim() || null
      : (existing?.injury_cause as string | null) ?? null;
  const notes =
    opts.injury.notes !== undefined
      ? opts.injury.notes?.trim() || null
      : (existing?.notes as string | null) ?? null;

  const row = {
    "PATIENTpatient_id": opts.patientId,
    injury_date,
    injury_cause,
    notes,
    review_date,
    updated_at: isoNow,
  };

  if (existing?.injury_id != null) {
    const { error } = await db
      .from("Patient Injury")
      .update(row)
      .eq("injury_id", existing.injury_id);
    if (error) throw new Error(`Patient Injury update failed: ${error.message}`);
  } else {
    const { error } = await db.from("Patient Injury").insert({
      ...row,
      created_at: isoNow,
    });
    if (error) throw new Error(`Patient Injury insert failed: ${error.message}`);
  }

  await writeAuditLog(db, {
    entityType: "Patient",
    entityId: String(opts.patientId),
    action: "patient.injury.update",
    staffId: opts.staffId,
    details: { injury_date, review_date },
  });
}

export async function loadPatientInjury(
  db: SupabaseClient,
  patientId: number
): Promise<{
  injuryDate: string;
  reviewDate: string;
  injuryCause: string;
  notes: string;
} | null> {
  const { data, error } = await db
    .from("Patient Injury")
    .select("injury_date, review_date, injury_cause, notes")
    .eq("PATIENTpatient_id", patientId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  return {
    injuryDate: toDateOnly(data.injury_date as string | null) ?? "",
    reviewDate: toDateOnly(data.review_date as string | null) ?? "",
    injuryCause: String(data.injury_cause ?? ""),
    notes: String(data.notes ?? ""),
  };
}
