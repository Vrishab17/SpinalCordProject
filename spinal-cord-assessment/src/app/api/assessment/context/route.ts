import { NextResponse } from "next/server";
import type { UiExam, UiScore } from "@/components/assessment/AssessmentForm";
import { LEVELS, MOTOR_LEVELS } from "@/components/assessment/examConstants";
import {
  defaultReviewDateFromInjury,
  toDateOnly,
} from "@/lib/assessmentDatesCore";
import {
  ASSESSMENT_NOT_FOUND_MESSAGE,
  assessmentIdParamLoadError,
  parseAssessmentIdParam,
} from "@/lib/assessmentId";
import { requireStaffSession } from "@/lib/api/requireStaffSession";
import { normalizeNhi } from "@/lib/nhi";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

function formatNZDate(ds: string | null | undefined): string {
  if (!ds) return "";
  const d = new Date(ds);
  if (Number.isNaN(d.getTime())) return ds;
  return d.toLocaleDateString("en-NZ", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function ageFromDob(dob: string | null | undefined): string {
  if (!dob) return "";
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return "";
  const today = new Date();
  let y = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) y--;
  return `${y} Years`;
}

function emptyScores(): Record<string, UiScore> {
  return LEVELS.reduce((acc, level) => {
    acc[level] = "";
    return acc;
  }, {} as Record<string, UiScore>);
}

function emptyExam(): UiExam {
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

function dbSideToUi(side: string): "right" | "left" {
  return side.toUpperCase() === "LEFT" ? "left" : "right";
}

async function loadPatientBundle(db: ReturnType<typeof getSupabaseAdmin>, nhi: string) {
  const { data: patient, error } = await db
    .from("Patient")
    .select("patient_id,nhi_number,date_of_birth,gender,ethnicity")
    .eq("nhi_number", normalizeNhi(nhi))
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!patient) return null;

  const patientId = patient.patient_id as number;
  const [nameRes, addrRes, injuryRes] = await Promise.all([
    db
      .from("Patient Name")
      .select("given_name,family_name")
      .eq("PATIENTpatient_id", patientId)
      .limit(1)
      .maybeSingle(),
    db
      .from("Patient Address")
      .select("line1,line2,suburb,city,postal_code,country")
      .eq("PATIENTpatient_id", patientId)
      .limit(1)
      .maybeSingle(),
    db
      .from("Patient Injury")
      .select("injury_date,review_date")
      .eq("PATIENTpatient_id", patientId)
      .maybeSingle(),
  ]);

  const name = nameRes.data as {
    given_name?: string | null;
    family_name?: string | null;
  } | null;
  const fullName =
    name && (name.family_name || name.given_name)
      ? `${name.family_name ?? ""}${name.family_name && name.given_name ? ", " : ""}${name.given_name ?? ""}`.trim()
      : "";

  const address = addrRes.data as Record<string, unknown> | null;
  const addressParts = address
    ? [
        address.line1,
        address.line2,
        address.suburb,
        address.city,
        address.postal_code != null ? String(address.postal_code) : null,
        address.country,
      ].filter((x): x is string => typeof x === "string" && x.trim() !== "")
    : [];

  const injuryDate = toDateOnly(injuryRes.data?.injury_date as string | null) ?? "";
  const reviewDate =
    toDateOnly(injuryRes.data?.review_date as string | null) ??
    defaultReviewDateFromInjury(injuryDate) ??
    "";

  return {
    patientId,
    nhi: String(patient.nhi_number ?? ""),
    injuryDate,
    reviewDate,
    bar: {
      name: fullName,
      dob: formatNZDate(patient.date_of_birth as string | null),
      age: ageFromDob(patient.date_of_birth as string | null),
      gender: String(patient.gender ?? ""),
      ethnicity: String(patient.ethnicity ?? ""),
      nhi: String(patient.nhi_number ?? ""),
      address: addressParts.length > 0 ? addressParts.join(", ") : "",
    },
  };
}

async function loadExam(db: ReturnType<typeof getSupabaseAdmin>, assessmentId: string) {
  const { data: examRow, error } = await db
    .from("Exam")
    .select("exam_id,voluntary_anal_contraction,deep_anal_pressure,comments")
    .eq("ASSESSMENTassessment_id", assessmentId)
    .order("exam_id", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!examRow) return { exam: emptyExam(), comments: "" };

  const exam = emptyExam();
  exam.voluntaryAnalContraction =
    (examRow.voluntary_anal_contraction as UiExam["voluntaryAnalContraction"]) ?? "";
  exam.deepAnalPressure =
    (examRow.deep_anal_pressure as UiExam["deepAnalPressure"]) ?? "";

  const { data: sides, error: sideError } = await db
    .from("Exam Side")
    .select("exam_side_id,side,lowest_non_key_muscle_w_motor")
    .eq("EXAMexam_id", examRow.exam_id);

  if (sideError) throw new Error(sideError.message);

  for (const sideRow of sides ?? []) {
    const uiSide = dbSideToUi(String(sideRow.side ?? ""));
    const sideId = sideRow.exam_side_id as number;
    exam[uiSide].lowestNonKeyMuscleWithMotorFunction =
      (sideRow.lowest_non_key_muscle_w_motor as string | null) ?? "";

    const [motorRes, ltRes, ppRes] = await Promise.all([
      db
        .from("Motor Score")
        .select("spinal_level,value")
        .eq("EXAM_SIDEexam_side_id", sideId),
      db
        .from("Light Touch Score")
        .select("spinal_level,value")
        .eq("EXAM_SIDEexam_side_id", sideId),
      db
        .from("Pin Prick Score")
        .select("spinal_level,value")
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

  return { exam, comments: (examRow.comments as string | null) ?? "" };
}

export async function GET(request: Request) {
  const auth = await requireStaffSession();
  if (auth.response) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const db = getSupabaseAdmin();
    const assessmentIdParam = searchParams.get("assessmentId");
    const assessmentIdError = assessmentIdParamLoadError(assessmentIdParam);
    if (assessmentIdError) {
      return NextResponse.json({ error: assessmentIdError }, { status: 400 });
    }

    const assessmentId = parseAssessmentIdParam(assessmentIdParam);
    if (assessmentId) {
      const { data: assessment, error } = await db
        .from("Assessment")
        .select(
          "assessment_id,PATIENTpatient_id,status,injury_date,review_date,created_at,updated_at"
        )
        .eq("assessment_id", assessmentId)
        .maybeSingle();

      if (error) throw new Error(error.message);
      if (!assessment) {
        return NextResponse.json(
          { error: ASSESSMENT_NOT_FOUND_MESSAGE },
          { status: 404 }
        );
      }

      const { data: patient, error: patientError } = await db
        .from("Patient")
        .select("nhi_number")
        .eq("patient_id", assessment.PATIENTpatient_id)
        .maybeSingle();
      if (patientError) throw new Error(patientError.message);
      if (!patient?.nhi_number) {
        return NextResponse.json({ error: "Patient not found" }, { status: 404 });
      }

      const patientBundle = await loadPatientBundle(db, String(patient.nhi_number));
      if (!patientBundle) {
        return NextResponse.json({ error: "Patient not found" }, { status: 404 });
      }

      const examBundle = await loadExam(db, assessmentId);
      const status = String(assessment.status ?? "DRAFT");
      const upper = status.toUpperCase();
      const injuryDate =
        toDateOnly(assessment.injury_date as string | null) ||
        patientBundle.injuryDate;
      const reviewDate =
        toDateOnly(assessment.review_date as string | null) ||
        patientBundle.reviewDate;

      return NextResponse.json({
        patientId: assessment.PATIENTpatient_id,
        resolvedNhi: patientBundle.nhi,
        displayAssessmentId: assessmentId,
        initialExam: examBundle.exam,
        initialComments: examBundle.comments,
        initialInjuryDate: injuryDate,
        initialReviewDate: reviewDate,
        initialCreatedAt: (assessment.created_at as string | null) ?? null,
        initialUpdatedAt: (assessment.updated_at as string | null) ?? null,
        readOnly: upper === "FINALISED" || upper === "FINALIZED",
        bar: patientBundle.bar,
      });
    }

    const nhi = normalizeNhi(searchParams.get("nhi") ?? "");
    if (!nhi) {
      return NextResponse.json({ error: "NHI or assessmentId is required" }, { status: 400 });
    }

    const patientBundle = await loadPatientBundle(db, nhi);
    if (!patientBundle) {
      return NextResponse.json({
        patientId: null,
        resolvedNhi: nhi,
        initialExam: null,
        initialComments: "",
        initialInjuryDate: "",
        initialReviewDate: "",
        initialCreatedAt: null,
        initialUpdatedAt: null,
        readOnly: false,
        bar: {
          name: "",
          dob: "",
          age: "",
          gender: "",
          ethnicity: "",
          nhi: "",
          address: "",
        },
      });
    }

    return NextResponse.json({
      patientId: patientBundle.patientId,
      resolvedNhi: patientBundle.nhi,
      displayAssessmentId: null,
      initialExam: null,
      initialComments: "",
      initialInjuryDate: patientBundle.injuryDate,
      initialReviewDate: patientBundle.reviewDate,
      initialCreatedAt: null,
      initialUpdatedAt: null,
      readOnly: false,
      bar: patientBundle.bar,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to load assessment" },
      { status: 500 }
    );
  }
}
