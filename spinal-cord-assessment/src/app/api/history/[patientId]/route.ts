import { NextResponse } from "next/server";
import { requireStaffSession } from "@/lib/api/requireStaffSession";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

type Props = {
  params: Promise<{ patientId: string }>;
};

function formatClinician(sn: {
  prefix: string | null;
  given_name: string | null;
  family_name: string | null;
} | undefined) {
  if (!sn) return "Unassigned";
  const fam = sn.family_name?.trim() ?? "";
  const given = sn.given_name?.trim() ?? "";
  if (!fam && !given) return "Unassigned";
  const prefix = (sn.prefix?.trim() || "Dr").replace(/\.$/, "");
  const initial = given ? `${given[0]}.` : "";
  return `${prefix} ${initial} ${fam}`.replace(/\s+/g, " ").trim();
}

export async function GET(_request: Request, { params }: Props) {
  const auth = await requireStaffSession();
  if (auth.response) return auth.response;

  const { patientId } = await params;
  const numericId = Number(patientId);
  if (!Number.isInteger(numericId) || Number.isNaN(numericId)) {
    return NextResponse.json(
      { error: "History route expects numeric patient_id." },
      { status: 400 }
    );
  }

  try {
    const db = getSupabaseAdmin();
    const [patientRes, nameRes, addressRes, assessRes] = await Promise.all([
      db
        .from("Patient")
        .select(
          "patient_id,nhi_number,date_of_birth,gender,nz_citizenship_status,place_of_birth,ethnicity"
        )
        .eq("patient_id", numericId)
        .maybeSingle(),
      db
        .from("Patient Name")
        .select("given_name,family_name")
        .eq("PATIENTpatient_id", numericId)
        .limit(1)
        .maybeSingle(),
      db
        .from("Patient Address")
        .select("line1,line2,suburb,city,postal_code,country")
        .eq("PATIENTpatient_id", numericId)
        .limit(1)
        .maybeSingle(),
      db
        .from("Assessment")
        .select("assessment_id,assessment_date,status,STAFFstaff_id,current_version")
        .eq("PATIENTpatient_id", numericId)
        .order("assessment_date", { ascending: false }),
    ]);

    if (patientRes.error) throw new Error(patientRes.error.message);
    if (!patientRes.data) {
      return NextResponse.json(
        { error: `No patient found for: ${patientId}` },
        { status: 404 }
      );
    }
    if (assessRes.error) throw new Error(assessRes.error.message);

    const assessments = assessRes.data ?? [];
    const staffIds = [
      ...new Set(
        assessments
          .map((a) => a.STAFFstaff_id as number | null)
          .filter((id): id is number => id != null)
      ),
    ];
    const assessmentIds = assessments.map((a) => a.assessment_id as string);

    const [staffRes, examRes] = await Promise.all([
      staffIds.length > 0
        ? db
            .from("Staff Name")
            .select("STAFFstaff_id,prefix,given_name,family_name")
            .in("STAFFstaff_id", staffIds)
        : Promise.resolve({ data: [] }),
      assessmentIds.length > 0
        ? db
            .from("Exam")
            .select("exam_id,ASSESSMENTassessment_id")
            .in("ASSESSMENTassessment_id", assessmentIds)
        : Promise.resolve({ data: [] }),
    ]);

    if ("error" in staffRes && staffRes.error) throw new Error(staffRes.error.message);
    if ("error" in examRes && examRes.error) throw new Error(examRes.error.message);

    const staffNameById = new Map<
      number,
      { prefix: string | null; given_name: string | null; family_name: string | null }
    >();
    for (const row of staffRes.data ?? []) {
      const r = row as {
        STAFFstaff_id: number;
        prefix: string | null;
        given_name: string | null;
        family_name: string | null;
      };
      staffNameById.set(r.STAFFstaff_id, r);
    }

    const bestExam = new Map<string, number>();
    for (const row of examRes.data ?? []) {
      const e = row as { exam_id: number; ASSESSMENTassessment_id: string };
      const prev = bestExam.get(e.ASSESSMENTassessment_id);
      if (prev === undefined || e.exam_id > prev) {
        bestExam.set(e.ASSESSMENTassessment_id, e.exam_id);
      }
    }

    const examIds = [...bestExam.values()];
    const aisByAssessment = new Map<string, string | null>();
    if (examIds.length > 0) {
      const { data: classRows, error } = await db
        .from("Classification Result")
        .select("EXAMexam_id,ais_grade")
        .in("EXAMexam_id", examIds);
      if (error) throw new Error(error.message);

      const aisByExam = new Map<number, string | null>();
      for (const row of classRows ?? []) {
        const cr = row as { EXAMexam_id: number; ais_grade: string | null };
        aisByExam.set(cr.EXAMexam_id, cr.ais_grade);
      }
      for (const [aid, eid] of bestExam) {
        aisByAssessment.set(aid, aisByExam.get(eid) ?? null);
      }
    }

    const name = nameRes.data as {
      given_name: string | null;
      family_name: string | null;
    } | null;
    const fullName =
      name && (name.family_name || name.given_name)
        ? `${name.family_name ?? ""}${name.family_name && name.given_name ? ", " : ""}${name.given_name ?? ""}`
        : "Unknown";

    const address = addressRes.data as {
      line1: string | null;
      line2: string | null;
      suburb: string | null;
      city: string | null;
      postal_code: number | null;
      country: string | null;
    } | null;
    const addressLines = address
      ? [
          address.line1,
          address.line2,
          address.suburb,
          address.city,
          address.country,
          address.postal_code != null ? String(address.postal_code) : null,
        ].filter((v): v is string => v != null && v.trim() !== "")
      : [];

    return NextResponse.json({
      patient: patientRes.data,
      fullName,
      addressLines,
      assessments: assessments.map((a) => {
        const sid = a.STAFFstaff_id as number | null;
        return {
          assessment_id: a.assessment_id as string,
          assessment_date: a.assessment_date as string | null,
          status: a.status as string | null,
          clinicianName: formatClinician(
            sid != null ? staffNameById.get(sid) : undefined
          ),
          alsGrade: aisByAssessment.get(a.assessment_id as string) ?? null,
        };
      }),
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to load patient history" },
      { status: 500 }
    );
  }
}
