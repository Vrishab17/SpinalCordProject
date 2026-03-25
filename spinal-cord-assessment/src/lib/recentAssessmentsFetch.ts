import type { SupabaseClient } from "@supabase/supabase-js";
import {
  formatDateShortDMY,
} from "@/lib/displayFormatters";

type AssessmentRow = {
  assessment_id: number;
  assessment_date: string;
  status: string;
  current_version: number;
  PATIENTpatient_id: number;
};

type PatientRow = {
  patient_id: number;
  nhi_number: string;
};

type PatientNameRow = {
  PATIENTpatient_id: number;
  given_name: string;
  family_name: string;
};

export type RecentAssessmentDisplay = {
  id: number;
  patientId: number;
  nhiNumber: string;
  patientName: string;
  date: string;
  versionNumber: string;
  status: string;
};

/**
 * Loads rows for the Recent Assessments table (same logic as the landing component).
 * Accepts a Supabase client so tests can inject a mock.
 */
export async function fetchRecentAssessmentsDisplay(
  client: SupabaseClient
): Promise<{ rows: RecentAssessmentDisplay[]; error: string | null }> {
  const { data: assessmentData, error: assessmentError } = await client
    .from("Assessment")
    .select(
      "assessment_id, assessment_date, status, current_version, PATIENTpatient_id"
    )
    .order("assessment_date", { ascending: false })
    .limit(50);

  if (assessmentError) {
    return {
      rows: [],
      error: `Assessment query failed: ${assessmentError.message}`,
    };
  }

  const assessments = (assessmentData ?? []) as AssessmentRow[];
  if (assessments.length === 0) {
    return { rows: [], error: null };
  }

  const patientIds = [...new Set(assessments.map((a) => a.PATIENTpatient_id))];

  const { data: patientData, error: patientError } = await client
    .from("Patient")
    .select("patient_id, nhi_number")
    .in("patient_id", patientIds);

  if (patientError) {
    return {
      rows: [],
      error: `Patient query failed: ${patientError.message}`,
    };
  }

  const { data: patientNameData, error: patientNameError } = await client
    .from("Patient Name")
    .select("PATIENTpatient_id, given_name, family_name")
    .in("PATIENTpatient_id", patientIds);

  if (patientNameError) {
    return {
      rows: [],
      error: `Patient Name query failed: ${patientNameError.message}`,
    };
  }

  const patients = (patientData ?? []) as PatientRow[];
  const patientNames = (patientNameData ?? []) as PatientNameRow[];

  const patientMap = new Map<number, PatientRow>();
  patients.forEach((p) => patientMap.set(p.patient_id, p));

  const nameMap = new Map<number, PatientNameRow>();
  patientNames.forEach((n) => nameMap.set(n.PATIENTpatient_id, n));

  const rows: RecentAssessmentDisplay[] = assessments.map((a) => {
    const patient = patientMap.get(a.PATIENTpatient_id);
    const name = nameMap.get(a.PATIENTpatient_id);

    return {
      id: a.assessment_id,
      patientId: a.PATIENTpatient_id,
      nhiNumber: patient?.nhi_number ?? "N/A",
      patientName: name
        ? `${name.given_name} ${name.family_name}`
        : `Patient #${a.PATIENTpatient_id}`,
      date: formatDateShortDMY(a.assessment_date),
      versionNumber: `v${a.current_version}`,
      status: a.status,
    };
  });

  return { rows, error: null };
}
