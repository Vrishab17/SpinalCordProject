import { NextResponse } from "next/server";
import { requireStaffSession } from "@/lib/api/requireStaffSession";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const PAGE_SIZE = 12;

type AssessmentRow = {
  assessment_id: string;
  assessment_date: string;
  status: string;
  current_version: number;
  PATIENTpatient_id: number;
};

type FilterSelections = {
  date: string | null;
  version: string | null;
  status: string | null;
};

function formatDate(dateString: string) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return `${String(date.getDate()).padStart(2, "0")}/${String(
    date.getMonth() + 1
  ).padStart(2, "0")}/${date.getFullYear()}`;
}

function assessmentTimestamp(row: AssessmentRow): number {
  const parsed = new Date(row.assessment_date).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

function keepLatestPerPatient(assessments: AssessmentRow[]): AssessmentRow[] {
  const byPatient = new Map<number, AssessmentRow>();
  for (const row of assessments) {
    const existing = byPatient.get(row.PATIENTpatient_id);
    if (
      !existing ||
      assessmentTimestamp(row) > assessmentTimestamp(existing) ||
      (assessmentTimestamp(row) === assessmentTimestamp(existing) &&
        row.current_version > existing.current_version)
    ) {
      byPatient.set(row.PATIENTpatient_id, row);
    }
  }
  return Array.from(byPatient.values());
}

function sortRows(rows: AssessmentRow[], filters: FilterSelections) {
  return [...rows].sort((a, b) => {
    if (filters.date) {
      const dateCmp =
        filters.date === "date_earliest_first"
          ? assessmentTimestamp(a) - assessmentTimestamp(b)
          : assessmentTimestamp(b) - assessmentTimestamp(a);
      if (dateCmp !== 0) return dateCmp;
    }
    if (filters.version) {
      return filters.version === "version_oldest"
        ? a.current_version - b.current_version
        : b.current_version - a.current_version;
    }
    return assessmentTimestamp(b) - assessmentTimestamp(a);
  });
}

export async function GET(request: Request) {
  const auth = await requireStaffSession();
  if (auth.response) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const scope = searchParams.get("scope") === "all" ? "all" : "mine";
    const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);
    const filters: FilterSelections = {
      date: searchParams.get("date"),
      version: searchParams.get("version"),
      status: searchParams.get("status"),
    };

    const db = getSupabaseAdmin();
    let query = db
      .from("Assessment")
      .select(
        "assessment_id, assessment_date, status, current_version, PATIENTpatient_id"
      );

    if (filters.status === "status_draft") {
      query = query.eq("status", "DRAFT");
    } else if (filters.status === "status_finalised") {
      query = query.in("status", ["FINALISED", "FINALIZED", "FINAL"]);
    }

    if (scope === "mine") {
      query = query.eq("STAFFstaff_id", auth.staff!.staffId);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    const sorted = sortRows(keepLatestPerPatient((data ?? []) as AssessmentRow[]), filters);
    const totalCount = sorted.length;
    const assessments = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    const patientIds = [...new Set(assessments.map((a) => a.PATIENTpatient_id))];

    const [patientRes, nameRes] =
      patientIds.length > 0
        ? await Promise.all([
            db
              .from("Patient")
              .select("patient_id,nhi_number")
              .in("patient_id", patientIds),
            db
              .from("Patient Name")
              .select("PATIENTpatient_id,given_name,family_name")
              .in("PATIENTpatient_id", patientIds),
          ])
        : [{ data: [] }, { data: [] }];

    if ("error" in patientRes && patientRes.error) throw new Error(patientRes.error.message);
    if ("error" in nameRes && nameRes.error) throw new Error(nameRes.error.message);

    const patientMap = new Map(
      (patientRes.data ?? []).map((p) => [p.patient_id as number, p])
    );
    const nameMap = new Map(
      (nameRes.data ?? []).map((n) => [n.PATIENTpatient_id as number, n])
    );

    const rows = assessments.map((a) => {
      const patient = patientMap.get(a.PATIENTpatient_id);
      const name = nameMap.get(a.PATIENTpatient_id);
      const parsed = new Date(a.assessment_date).getTime();
      return {
        id: a.assessment_id,
        patientId: a.PATIENTpatient_id,
        nhiNumber: patient?.nhi_number ?? "N/A",
        patientName: name
          ? `${name.given_name ?? ""} ${name.family_name ?? ""}`.trim()
          : `Patient #${a.PATIENTpatient_id}`,
        date: formatDate(a.assessment_date),
        assessmentDateMs: Number.isNaN(parsed) ? 0 : parsed,
        versionNum: a.current_version,
        versionNumber: `v${a.current_version}`,
        status: a.status,
      };
    });

    return NextResponse.json({ rows, totalCount });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Recent assessments failed" },
      { status: 500 }
    );
  }
}
