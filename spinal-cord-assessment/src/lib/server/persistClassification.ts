import type { AssessmentId } from "@/lib/assessmentId";
import { extractAisGradeFromResult } from "@/lib/extractAisGrade";
import type { SupabaseClient } from "@supabase/supabase-js";

type ClassificationPayload = {
  nli_sensory_right: string | null;
  nli_sensory_left: string | null;
  nli_motor_right: string | null;
  nli_motor_left: string | null;
  neurological_level_of_injury: string | null;
  injury_complete: string | null;
  ais_grade: string | null;
  zpp_sensory_right: string | null;
  zpp_sensory_left: string | null;
  zpp_motor_right: string | null;
  zpp_motor_left: string | null;
  calculated_at: string;
};

type TotalsPayload = {
  right_upper_extremity: string | null;
  right_lower_extremity: string | null;
  right_light_touch: string | null;
  right_pin_prick: string | null;
  right_motor: string | null;
  left_upper_extremity: string | null;
  left_lower_extremity: string | null;
  left_light_touch: string | null;
  left_pin_prick: string | null;
  left_motor: string | null;
  upper_extremity_total: string | null;
  lower_extremity_total: string | null;
  light_touch_total: string | null;
  pin_prick_total: string | null;
  calculated_at: string;
};

function str(value: unknown): string | null {
  if (value == null || value === "") return null;
  return String(value);
}

function mapClassificationResult(result: unknown): ClassificationPayload | null {
  const r = result as { classification?: Record<string, unknown> } | null;
  const c = r?.classification;
  if (!c || typeof c !== "object") return null;

  const nl = (c.neurologicalLevels ?? c.neurologicalLevel) as
    | Record<string, unknown>
    | undefined;
  const zpp = (c.zoneOfPartialPreservations ??
    c.zoneOfPartialPreservation) as Record<string, unknown> | undefined;

  const ais =
    extractAisGradeFromResult(result) ??
    str(c.ASIAImpairmentScale ?? c.asiaImpairmentScale);

  return {
    nli_sensory_right: str(nl?.sensoryRight),
    nli_sensory_left: str(nl?.sensoryLeft),
    nli_motor_right: str(nl?.motorRight),
    nli_motor_left: str(nl?.motorLeft),
    neurological_level_of_injury: str(c.neurologicalLevelOfInjury),
    injury_complete: str(c.injuryComplete ?? c.completeOrIncomplete),
    ais_grade: ais,
    zpp_sensory_right: str(zpp?.sensoryRight),
    zpp_sensory_left: str(zpp?.sensoryLeft),
    zpp_motor_right: str(zpp?.motorRight),
    zpp_motor_left: str(zpp?.motorLeft),
    calculated_at: new Date().toISOString(),
  };
}

function mapAssessmentTotals(result: unknown): TotalsPayload | null {
  const t = (result as { totals?: Record<string, unknown> } | null)?.totals;
  if (!t || typeof t !== "object") return null;

  const right = t.right as Record<string, unknown> | undefined;
  const left = t.left as Record<string, unknown> | undefined;
  const calculated_at = new Date().toISOString();

  return {
    right_upper_extremity: str(right?.upperExtremity),
    right_lower_extremity: str(right?.lowerExtremity),
    right_light_touch: str(right?.lightTouch),
    right_pin_prick: str(right?.pinPrick),
    right_motor: str(right?.motor),
    left_upper_extremity: str(left?.upperExtremity),
    left_lower_extremity: str(left?.lowerExtremity),
    left_light_touch: str(left?.lightTouch),
    left_pin_prick: str(left?.pinPrick),
    left_motor: str(left?.motor),
    upper_extremity_total: str(t.upperExtremity),
    lower_extremity_total: str(t.lowerExtremity),
    light_touch_total: str(t.lightTouch),
    pin_prick_total: str(t.pinPrick),
    calculated_at,
  };
}

export async function persistClassificationOnServer(
  db: SupabaseClient,
  opts: { assessmentId: AssessmentId; result: unknown }
): Promise<void> {
  const classification = mapClassificationResult(opts.result);
  if (!classification?.ais_grade) {
    throw new Error("Could not read AIS grade from the classification result.");
  }

  const totals = mapAssessmentTotals(opts.result);

  const { data: examRow, error: exFindErr } = await db
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

  const { data: existingClass } = await db
    .from("Classification Result")
    .select("classification_id")
    .eq("EXAMexam_id", examId)
    .maybeSingle();

  if (existingClass?.classification_id != null) {
    const { error: crErr } = await db
      .from("Classification Result")
      .update(classification)
      .eq("classification_id", existingClass.classification_id);
    if (crErr) throw new Error(crErr.message);
  } else {
    const { error: crErr } = await db.from("Classification Result").insert({
      EXAMexam_id: examId,
      ...classification,
    });
    if (crErr) throw new Error(crErr.message);
  }

  if (!totals) return;

  const { data: existingTotals } = await db
    .from("Assessment Totals")
    .select("totals_id")
    .eq("EXAMexam_id", examId)
    .maybeSingle();

  if (existingTotals?.totals_id != null) {
    const { error: tErr } = await db
      .from("Assessment Totals")
      .update(totals)
      .eq("totals_id", existingTotals.totals_id);
    if (tErr) throw new Error(tErr.message);
  } else {
    const { error: tErr } = await db.from("Assessment Totals").insert({
      EXAMexam_id: examId,
      ...totals,
    });
    if (tErr) throw new Error(tErr.message);
  }
}
