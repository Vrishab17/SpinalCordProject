import { NextResponse } from "next/server";
import { requireStaffSession } from "@/lib/api/requireStaffSession";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

type AssessmentRow = {
  assessment_id: string;
  PATIENTpatient_id: number;
  review_date: string;
};

function formatReviewDate(dateString: string) {
  const reviewDate = new Date(dateString);
  const today = new Date();
  const reviewOnly = new Date(
    reviewDate.getFullYear(),
    reviewDate.getMonth(),
    reviewDate.getDate()
  );
  const todayOnly = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const reviewDateMs = reviewOnly.getTime();
  const isToday = reviewDateMs === todayOnly.getTime();
  const isOverdue = reviewDateMs < todayOnly.getTime();

  if (isToday) {
    return { formatted: "Today", isToday, isOverdue: false, reviewDateMs };
  }

  return {
    formatted: `${String(reviewDate.getDate()).padStart(2, "0")}/${String(
      reviewDate.getMonth() + 1
    ).padStart(2, "0")}/${reviewDate.getFullYear()}`,
    isToday: false,
    isOverdue,
    reviewDateMs,
  };
}

export async function GET(request: Request) {
  const auth = await requireStaffSession();
  if (auth.response) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const scope = searchParams.get("scope") === "all" ? "all" : "mine";
    const db = getSupabaseAdmin();

    let query = db
      .from("Assessment")
      .select("assessment_id,PATIENTpatient_id,review_date,STAFFstaff_id")
      .not("review_date", "is", null)
      .order("review_date", { ascending: true });

    if (scope === "mine") {
      query = query.eq("STAFFstaff_id", auth.staff!.staffId);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    const latestPerPatient = new Map<number, AssessmentRow>();
    for (const row of (data ?? []) as AssessmentRow[]) {
      if (!latestPerPatient.has(row.PATIENTpatient_id)) {
        latestPerPatient.set(row.PATIENTpatient_id, row);
      }
    }

    const assessments = Array.from(latestPerPatient.values());
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

    const rows = assessments.map((assessment) => {
      const patient = patientMap.get(assessment.PATIENTpatient_id);
      const name = nameMap.get(assessment.PATIENTpatient_id);
      const reviewDate = formatReviewDate(assessment.review_date);
      return {
        id: assessment.assessment_id,
        patientId: assessment.PATIENTpatient_id,
        nhi: patient?.nhi_number ?? "N/A",
        patientName: name
          ? `${name.given_name ?? ""} ${name.family_name ?? ""}`.trim()
          : `Patient #${assessment.PATIENTpatient_id}`,
        date: reviewDate.formatted,
        isToday: reviewDate.isToday,
        isOverdue: reviewDate.isOverdue,
        reviewDateMs: reviewDate.reviewDateMs,
      };
    });

    return NextResponse.json({ rows });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Upcoming reviews failed" },
      { status: 500 }
    );
  }
}
