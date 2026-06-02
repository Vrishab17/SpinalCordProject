import type { UiExam, UiScore } from "@/components/assessment/AssessmentForm";
import { LEVELS, MOTOR_LEVELS } from "@/components/assessment/examConstants";
import type { AssessmentId } from "./assessmentId";
import { supabase } from "./supabaseClient";

type DbSide = "RIGHT" | "LEFT";
type UiSide = "right" | "left";

function emptyScores(): Record<string, UiScore> {
  return LEVELS.reduce(
    (acc, level) => {
      acc[level] = "";
      return acc;
    },
    {} as Record<string, UiScore>
  );
}

export function emptyUiExam(): UiExam {
  return {
    right: {
      lowestNonKeyMuscleWithMotorFunction: "",
      motor: emptyScores(),
      lightTouch: emptyScores(),
      pinPrick: emptyScores(),
    },
    left: {
      lowestNonKeyMuscleWithMotorFunction: "",
      motor: emptyScores(),
      lightTouch: emptyScores(),
      pinPrick: emptyScores(),
    },
    voluntaryAnalContraction: "",
    deepAnalPressure: "",
  };
}

function uiSideToDb(side: UiSide): DbSide {
  return side === "right" ? "RIGHT" : "LEFT";
}

function dbSideToUi(side: string): UiSide {
  return side.toUpperCase() === "LEFT" ? "left" : "right";
}

async function nextId(
  table:
    | "Exam"
    | "Exam Side"
    | "Motor Score"
    | "Light Touch Score"
    | "Pin Prick Score",
  column: string
): Promise<number> {
  const { data, error } = await supabase
    .from(table)
    .select(column)
    .order(column, { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  const max = (data as Record<string, number> | null)?.[column];
  if (typeof max === "number" && Number.isFinite(max)) return max + 1;
  return 1;
}

export type LoadedAssessmentContext = {
  assessmentId: AssessmentId;
  patientId: number;
  nhi: string;
  status: string;
  exam: UiExam;
  comments: string;
  isFinalised: boolean;
};

export async function loadAssessmentContext(
  assessmentId: AssessmentId
): Promise<LoadedAssessmentContext | null> {
  const { data: assessment, error: aErr } = await supabase
    .from("Assessment")
    .select("assessment_id, PATIENTpatient_id, status")
    .eq("assessment_id", assessmentId)
    .maybeSingle();

  if (aErr) throw new Error(aErr.message);
  if (!assessment) return null;

  const patientId = assessment.PATIENTpatient_id as number;

  const { data: patient, error: pErr } = await supabase
    .from("Patient")
    .select("nhi_number")
    .eq("patient_id", patientId)
    .maybeSingle();

  if (pErr) throw new Error(pErr.message);
  if (!patient?.nhi_number) return null;

  const examBundle = await loadExamDataForAssessment(assessmentId);
  const status = String(assessment.status ?? "DRAFT");
  const upper = status.toUpperCase();

  return {
    assessmentId,
    patientId,
    nhi: patient.nhi_number as string,
    status,
    exam: examBundle?.exam ?? emptyUiExam(),
    comments: examBundle?.comments ?? "",
    isFinalised: upper === "FINALISED" || upper === "FINALIZED",
  };
}

export async function loadExamDataForAssessment(
  assessmentId: AssessmentId
): Promise<{ exam: UiExam; comments: string } | null> {
  const { data: examRow, error: eErr } = await supabase
    .from("Exam")
    .select(
      "exam_id, voluntary_anal_contraction, deep_anal_pressure, comments"
    )
    .eq("ASSESSMENTassessment_id", assessmentId)
    .order("exam_id", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (eErr) throw new Error(eErr.message);
  if (!examRow) return null;

  const examId = examRow.exam_id as number;
  const exam = emptyUiExam();
  exam.voluntaryAnalContraction =
    (examRow.voluntary_anal_contraction as UiExam["voluntaryAnalContraction"]) ??
    "";
  exam.deepAnalPressure =
    (examRow.deep_anal_pressure as UiExam["deepAnalPressure"]) ?? "";
  const comments = (examRow.comments as string | null) ?? "";

  const { data: sides, error: sErr } = await supabase
    .from("Exam Side")
    .select("exam_side_id, side, lowest_non_key_muscle_w_motor")
    .eq("EXAMexam_id", examId);

  if (sErr) throw new Error(sErr.message);

  for (const sideRow of sides ?? []) {
    const uiSide = dbSideToUi(sideRow.side as string);
    const sideId = sideRow.exam_side_id as number;

    exam[uiSide].lowestNonKeyMuscleWithMotorFunction =
      (sideRow.lowest_non_key_muscle_w_motor as string | null) ?? "";

    const [motorRes, ltRes, ppRes] = await Promise.all([
      supabase
        .from("Motor Score")
        .select("spinal_level, value")
        .eq("EXAM_SIDEexam_side_id", sideId),
      supabase
        .from("Light Touch Score")
        .select("spinal_level, value")
        .eq("EXAM_SIDEexam_side_id", sideId),
      supabase
        .from("Pin Prick Score")
        .select("spinal_level, value")
        .eq("EXAM_SIDEexam_side_id", sideId),
    ]);

    if (motorRes.error) throw new Error(motorRes.error.message);
    if (ltRes.error) throw new Error(ltRes.error.message);
    if (ppRes.error) throw new Error(ppRes.error.message);

    for (const row of motorRes.data ?? []) {
      const level = row.spinal_level as string;
      if (MOTOR_LEVELS.includes(level as (typeof MOTOR_LEVELS)[number])) {
        exam[uiSide].motor[level] = (row.value as UiScore) ?? "";
      }
    }
    for (const row of ltRes.data ?? []) {
      const level = row.spinal_level as string;
      if (LEVELS.includes(level as (typeof LEVELS)[number])) {
        exam[uiSide].lightTouch[level] = (row.value as UiScore) ?? "";
      }
    }
    for (const row of ppRes.data ?? []) {
      const level = row.spinal_level as string;
      if (LEVELS.includes(level as (typeof LEVELS)[number])) {
        exam[uiSide].pinPrick[level] = (row.value as UiScore) ?? "";
      }
    }
  }

  return { exam, comments };
}

export async function persistExamData(opts: {
  assessmentId: AssessmentId;
  exam: UiExam;
  comments: string;
}): Promise<{ examId: number }> {
  const dateOnly = new Date().toISOString().slice(0, 10);

  const { data: existingExam, error: findErr } = await supabase
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
    const { error } = await supabase
      .from("Exam")
      .update({
        voluntary_anal_contraction: opts.exam.voluntaryAnalContraction || null,
        deep_anal_pressure: opts.exam.deepAnalPressure || null,
        comments: opts.comments || null,
        exam_date: dateOnly,
      })
      .eq("exam_id", examId);
    if (error) throw new Error(error.message);
  } else {
    examId = await nextId("Exam", "exam_id");
    const { error } = await supabase.from("Exam").insert({
      exam_id: examId,
      ASSESSMENTassessment_id: opts.assessmentId,
      version_number: 1,
      exam_date: dateOnly,
      voluntary_anal_contraction: opts.exam.voluntaryAnalContraction || null,
      deep_anal_pressure: opts.exam.deepAnalPressure || null,
      comments: opts.comments || null,
    });
    if (error) throw new Error(error.message);
  }

  for (const uiSide of ["right", "left"] as const) {
    const dbSide = uiSideToDb(uiSide);
    const sideData = opts.exam[uiSide];

    const { data: existingSide, error: sideFindErr } = await supabase
      .from("Exam Side")
      .select("exam_side_id")
      .eq("EXAMexam_id", examId)
      .eq("side", dbSide)
      .maybeSingle();

    if (sideFindErr) throw new Error(sideFindErr.message);

    let sideId: number;
    if (existingSide?.exam_side_id != null) {
      sideId = existingSide.exam_side_id as number;
      const { error } = await supabase
        .from("Exam Side")
        .update({
          lowest_non_key_muscle_w_motor:
            sideData.lowestNonKeyMuscleWithMotorFunction || null,
        })
        .eq("exam_side_id", sideId);
      if (error) throw new Error(error.message);
    } else {
      sideId = await nextId("Exam Side", "exam_side_id");
      const { error } = await supabase.from("Exam Side").insert({
        exam_side_id: sideId,
        EXAMexam_id: examId,
        side: dbSide,
        lowest_non_key_muscle_w_motor:
          sideData.lowestNonKeyMuscleWithMotorFunction || null,
      });
      if (error) throw new Error(error.message);
    }

    await Promise.all([
      supabase
        .from("Motor Score")
        .delete()
        .eq("EXAM_SIDEexam_side_id", sideId),
      supabase
        .from("Light Touch Score")
        .delete()
        .eq("EXAM_SIDEexam_side_id", sideId),
      supabase
        .from("Pin Prick Score")
        .delete()
        .eq("EXAM_SIDEexam_side_id", sideId),
    ]);

    let nextMotorId = await nextId("Motor Score", "motor_score_id");
    const motorRows = MOTOR_LEVELS.filter((level) => sideData.motor[level]).map(
      (level) => ({
        motor_score_id: nextMotorId++,
        EXAM_SIDEexam_side_id: sideId,
        spinal_level: level,
        value: sideData.motor[level],
      })
    );
    if (motorRows.length > 0) {
      const { error } = await supabase.from("Motor Score").insert(motorRows);
      if (error) throw new Error(error.message);
    }

    let nextLtId = await nextId("Light Touch Score", "lt_score_id");
    const ltRows = LEVELS.filter((level) => sideData.lightTouch[level]).map(
      (level) => ({
        lt_score_id: nextLtId++,
        EXAM_SIDEexam_side_id: sideId,
        spinal_level: level,
        value: sideData.lightTouch[level],
      })
    );
    if (ltRows.length > 0) {
      const { error } = await supabase
        .from("Light Touch Score")
        .insert(ltRows);
      if (error) throw new Error(error.message);
    }

    let nextPpId = await nextId("Pin Prick Score", "pp_score_id");
    const ppRows = LEVELS.filter((level) => sideData.pinPrick[level]).map(
      (level) => ({
        pp_score_id: nextPpId++,
        EXAM_SIDEexam_side_id: sideId,
        spinal_level: level,
        value: sideData.pinPrick[level],
      })
    );
    if (ppRows.length > 0) {
      const { error } = await supabase.from("Pin Prick Score").insert(ppRows);
      if (error) throw new Error(error.message);
    }
  }

  return { examId };
}
