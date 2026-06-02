import type { UiExam, UiScore } from "@/components/assessment/AssessmentForm";
import { LEVELS, MOTOR_LEVELS } from "@/components/assessment/examConstants";
import type { AssessmentId } from "@/lib/assessmentId";
import type { SupabaseClient } from "@supabase/supabase-js";

type DbSide = "RIGHT" | "LEFT";
type UiSide = "right" | "left";

function uiSideToDb(side: UiSide): DbSide {
  return side === "right" ? "RIGHT" : "LEFT";
}

export async function persistExamDataOnServer(
  db: SupabaseClient,
  opts: {
    assessmentId: AssessmentId;
    exam: UiExam;
    comments: string;
    versionNumber: number;
  }
): Promise<{ examId: number }> {
  const dateOnly = new Date().toISOString().slice(0, 10);
  const isoNow = new Date().toISOString();

  const { data: existingExam, error: findErr } = await db
    .from("Exam")
    .select("exam_id")
    .eq("ASSESSMENTassessment_id", opts.assessmentId)
    .order("exam_id", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (findErr) throw new Error(findErr.message);

  let examId: number;
  if (existingExam?.exam_id != null) {
    examId = existingExam.exam_id as number;
    const { error } = await db
      .from("Exam")
      .update({
        voluntary_anal_contraction: opts.exam.voluntaryAnalContraction || null,
        deep_anal_pressure: opts.exam.deepAnalPressure || null,
        comments: opts.comments || null,
        exam_date: dateOnly,
        version_number: opts.versionNumber,
      })
      .eq("exam_id", examId);
    if (error) throw new Error(error.message);
  } else {
    const { data: inserted, error } = await db
      .from("Exam")
      .insert({
        ASSESSMENTassessment_id: opts.assessmentId,
        version_number: opts.versionNumber,
        exam_date: dateOnly,
        voluntary_anal_contraction: opts.exam.voluntaryAnalContraction || null,
        deep_anal_pressure: opts.exam.deepAnalPressure || null,
        comments: opts.comments || null,
        created_at: isoNow,
      })
      .select("exam_id")
      .single();
    if (error || !inserted?.exam_id) {
      throw new Error(error?.message ?? "Exam insert failed");
    }
    examId = inserted.exam_id as number;
  }

  for (const uiSide of ["right", "left"] as const) {
    const dbSide = uiSideToDb(uiSide);
    const sideData = opts.exam[uiSide];

    const { data: existingSide, error: sideFindErr } = await db
      .from("Exam Side")
      .select("exam_side_id")
      .eq("EXAMexam_id", examId)
      .eq("side", dbSide)
      .maybeSingle();

    if (sideFindErr) throw new Error(sideFindErr.message);

    let sideId: number;
    if (existingSide?.exam_side_id != null) {
      sideId = existingSide.exam_side_id as number;
      const { error } = await db
        .from("Exam Side")
        .update({
          lowest_non_key_muscle_w_motor:
            sideData.lowestNonKeyMuscleWithMotorFunction || null,
        })
        .eq("exam_side_id", sideId);
      if (error) throw new Error(error.message);
    } else {
      const { data: sideRow, error } = await db
        .from("Exam Side")
        .insert({
          EXAMexam_id: examId,
          side: dbSide,
          lowest_non_key_muscle_w_motor:
            sideData.lowestNonKeyMuscleWithMotorFunction || null,
          created_at: isoNow,
        })
        .select("exam_side_id")
        .single();
      if (error || !sideRow?.exam_side_id) {
        throw new Error(error?.message ?? "Exam Side insert failed");
      }
      sideId = sideRow.exam_side_id as number;
    }

    const delResults = await Promise.all([
      db.from("Motor Score").delete().eq("EXAM_SIDEexam_side_id", sideId),
      db.from("Light Touch Score").delete().eq("EXAM_SIDEexam_side_id", sideId),
      db.from("Pin Prick Score").delete().eq("EXAM_SIDEexam_side_id", sideId),
    ]);
    for (const r of delResults) {
      if (r.error) throw new Error(r.error.message);
    }

    const motorRows = MOTOR_LEVELS.filter((level) => sideData.motor[level]).map(
      (level) => ({
        EXAM_SIDEexam_side_id: sideId,
        spinal_level: level,
        value: sideData.motor[level] as UiScore,
        created_at: isoNow,
      })
    );
    if (motorRows.length > 0) {
      const { error } = await db.from("Motor Score").insert(motorRows);
      if (error) throw new Error(error.message);
    }

    const ltRows = LEVELS.filter((level) => sideData.lightTouch[level]).map(
      (level) => ({
        EXAM_SIDEexam_side_id: sideId,
        spinal_level: level,
        value: sideData.lightTouch[level] as UiScore,
        created_at: isoNow,
      })
    );
    if (ltRows.length > 0) {
      const { error } = await db.from("Light Touch Score").insert(ltRows);
      if (error) throw new Error(error.message);
    }

    const ppRows = LEVELS.filter((level) => sideData.pinPrick[level]).map(
      (level) => ({
        EXAM_SIDEexam_side_id: sideId,
        spinal_level: level,
        value: sideData.pinPrick[level] as UiScore,
        created_at: isoNow,
      })
    );
    if (ppRows.length > 0) {
      const { error } = await db.from("Pin Prick Score").insert(ppRows);
      if (error) throw new Error(error.message);
    }
  }

  return { examId };
}
