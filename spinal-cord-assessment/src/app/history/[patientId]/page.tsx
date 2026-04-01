import Link from "next/link";
import Header from "@/components/layout/Header";
import { supabase } from "@/lib/supabaseClient";
import AssessmentHistoryPanel from "./AssessmentHistoryPanel";
import type { AssessmentDisplay } from "./AssessmentHistoryPanel";

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = {
  params: Promise<{ patientId: string }>;
};

type PatientRow = {
  patient_id: number;
  nhi_number: string | null;
  date_of_birth: string | null;
  gender: string | null;
  nz_citizenship_status: string | null;
  ethnicity: string | null;
  place_of_birth: string | null;
};

type PatientNameRow = {
  PATIENTpatient_id: number;
  given_name: string | null;
  family_name: string | null;
};

type PatientAddressRow = {
  PATIENTpatient_id: number;
  line1: string | null;
  line2: string | null;
  suburb: string | null;
  city: string | null;
  postal_code: number | null;
  country: string | null;
};

type AssessmentRow = {
  assessment_id: number;
  assessment_date: string | null;
  status: string | null;
  STAFFstaff_id: number | null;
};

type ExamRow = {
  exam_id: number;
  ASSESSMENTassessment_id: number;
};

type ClassificationResultRow = {
  EXAMexam_id: number;
  als_grade: string | null;
};

type StaffNameRow = {
  STAFFstaff_id: number;
  prefix: string | null;
  given_name: string | null;
  family_name: string | null;
};

const SEL = {
  patient:
    "patient_id,nhi_number,date_of_birth,gender,nz_citizenship_status,place_of_birth,ethnicity",
  name: "PATIENTpatient_id,given_name,family_name",
  address:
    "PATIENTpatient_id,line1,line2,suburb,city,postal_code,country",
  assessment:
    "assessment_id,assessment_date,status,STAFFstaff_id",
  exam: "exam_id,ASSESSMENTassessment_id",
  classification_result: "EXAMexam_id,als_grade",
  staff_name: "STAFFstaff_id,prefix,given_name,family_name",
} as const;

// ─── Design tokens (matched to landing page / globals.css) ───────────────────

const NAVY       = "#15284C";
const BORDER     = "#D6D6D6";
const BG         = "#F6F4EC";
const BTN_PRIMARY = "#2D3E5E";
const LABEL_COL  = "#6B7A96";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(ds: string | null | undefined): string {
  if (!ds) return "N/A";
  const d = new Date(ds);
  if (Number.isNaN(d.getTime())) return ds;
  return d.toLocaleDateString("en-NZ", { day: "2-digit", month: "long", year: "numeric" });
}

function calculateAge(dob: string | null | undefined): string {
  if (!dob) return "N/A";
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return "N/A";
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return `${age} Years`;
}

function displayStatus(status: string | null | undefined): string {
  if (!status) return "Unknown";
  const u = status.toUpperCase();
  if (u === "FINALISED" || u === "FINALIZED") return "FINAL";
  return u;
}

function formatClinicianFromStaffName(sn: StaffNameRow | undefined): string {
  if (!sn) return "Unassigned";
  const fam = sn.family_name?.trim() ?? "";
  const given = sn.given_name?.trim() ?? "";
  if (!fam && !given) return "Unassigned";
  const prefix = (sn.prefix?.trim() || "Dr").replace(/\.$/, "");
  const initial = given ? `${given[0]}.` : "";
  return `${prefix} ${initial} ${fam}`.replace(/\s+/g, " ").trim();
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function Page({ params }: Props) {
  const { patientId } = await params;

  const numericId = Number(patientId);
  const isNumeric = Number.isInteger(numericId) && !Number.isNaN(numericId);

  let patient: PatientRow;
  let name: PatientNameRow | null;
  let address: PatientAddressRow | null;
  let assessments: AssessmentRow[];
  let assessmentRes: { error: { message: string } | null };

  if (isNumeric) {
    const [patientRes, nameRes, addressRes, assessRes] = await Promise.all([
      supabase.from("Patient").select(SEL.patient).eq("patient_id", numericId).maybeSingle(),
      supabase.from("Patient Name").select(SEL.name)
        .eq("PATIENTpatient_id", numericId).limit(1).maybeSingle(),
      supabase.from("Patient Address").select(SEL.address)
        .eq("PATIENTpatient_id", numericId).limit(1).maybeSingle(),
      supabase.from("Assessment").select(SEL.assessment)
        .eq("PATIENTpatient_id", numericId)
        .order("assessment_date", { ascending: false }),
    ]);

    if (patientRes.error || !patientRes.data) {
      return (
        <div style={{ minHeight: "100vh", backgroundColor: BG }}>
          <Header />
          <div style={{ padding: "40px", fontSize: 15, color: patientRes.error ? "#DC2626" : NAVY }}>
            {patientRes.error
              ? `Failed to load patient: ${patientRes.error.message}`
              : `No patient found for: ${patientId}`}
          </div>
        </div>
      );
    }

    patient = patientRes.data as PatientRow;
    name = nameRes.data as PatientNameRow | null;
    address = addressRes.data as PatientAddressRow | null;
    assessments = (assessRes.data ?? []) as AssessmentRow[];
    assessmentRes = { error: assessRes.error };
  } else {
    const { data: patientData, error: patientError } = await supabase
      .from("Patient")
      .select(SEL.patient)
      .eq("nhi_number", patientId)
      .maybeSingle();

    if (patientError || !patientData) {
      return (
        <div style={{ minHeight: "100vh", backgroundColor: BG }}>
          <Header />
          <div style={{ padding: "40px", fontSize: 15, color: patientError ? "#DC2626" : NAVY }}>
            {patientError
              ? `Failed to load patient: ${patientError.message}`
              : `No patient found for: ${patientId}`}
          </div>
        </div>
      );
    }

    patient = patientData as PatientRow;
    const pid = patient.patient_id;

    const [nameRes, addressRes, assessRes] = await Promise.all([
      supabase.from("Patient Name").select(SEL.name)
        .eq("PATIENTpatient_id", pid).limit(1).maybeSingle(),
      supabase.from("Patient Address").select(SEL.address)
        .eq("PATIENTpatient_id", pid).limit(1).maybeSingle(),
      supabase.from("Assessment").select(SEL.assessment)
        .eq("PATIENTpatient_id", pid)
        .order("assessment_date", { ascending: false }),
    ]);

    name = nameRes.data as PatientNameRow | null;
    address = addressRes.data as PatientAddressRow | null;
    assessments = (assessRes.data ?? []) as AssessmentRow[];
    assessmentRes = { error: assessRes.error };
  }

  // ── Staff names (Assessment.STAFFstaff_id → Staff Name) ──
  const staffIds = [...new Set(
    assessments.map((a) => a.STAFFstaff_id).filter((id): id is number => id != null)
  )];
  const staffNameById = new Map<number, StaffNameRow>();

  if (staffIds.length > 0) {
    const { data: staffNameRows } = await supabase
      .from("Staff Name")
      .select(SEL.staff_name)
      .in("STAFFstaff_id", staffIds);

    (staffNameRows ?? []).forEach((row) => {
      const r = row as StaffNameRow;
      staffNameById.set(r.STAFFstaff_id, r);
    });
  }

  // ── AIS grade: Assessment → Exam → Classification Result (als_grade) ──
  const assessmentIds = assessments.map((a) => a.assessment_id);
  const alsGradeByAssessmentId = new Map<number, string | null>();

  if (assessmentIds.length > 0) {
    const { data: examRows } = await supabase
      .from("Exam")
      .select(SEL.exam)
      .in("ASSESSMENTassessment_id", assessmentIds);

    const bestExamByAssessment = new Map<number, number>();
    for (const row of examRows ?? []) {
      const e = row as ExamRow;
      const prev = bestExamByAssessment.get(e.ASSESSMENTassessment_id);
      if (prev === undefined || e.exam_id > prev) {
        bestExamByAssessment.set(e.ASSESSMENTassessment_id, e.exam_id);
      }
    }

    const examIds = [...bestExamByAssessment.values()];
    if (examIds.length > 0) {
      const { data: classRows } = await supabase
        .from("Classification Result")
        .select(SEL.classification_result)
        .in("EXAMexam_id", examIds);

      const alsByExam = new Map<number, string | null>();
      for (const row of classRows ?? []) {
        const cr = row as ClassificationResultRow;
        alsByExam.set(cr.EXAMexam_id, cr.als_grade);
      }

      for (const [assessmentId, examId] of bestExamByAssessment) {
        alsGradeByAssessmentId.set(assessmentId, alsByExam.get(examId) ?? null);
      }
    }
  }

  // ── Derived values ──
  const fullName = name && (name.family_name || name.given_name)
    ? `${name.family_name ?? ""}${name.family_name && name.given_name ? ", " : ""}${name.given_name ?? ""}`
    : "Unknown";

  const addressLines: string[] = address
    ? [address.line1, address.line2, address.suburb, address.city, address.country,
       address.postal_code != null ? String(address.postal_code) : null]
        .filter((v): v is string => v != null && v.trim() !== "")
    : [];

  type DetailRow = { label: string; value: React.ReactNode };

  const detailRows: DetailRow[] = [
    { label: "Date of Birth", value: formatDate(patient.date_of_birth) },
    { label: "Age",           value: calculateAge(patient.date_of_birth) },
    { label: "Gender",        value: patient.gender ?? "Unknown" },
    { label: "Ethnicity",     value: patient.ethnicity ?? "N/A" },
    { label: "Place of Birth", value: patient.place_of_birth ?? "N/A" },
    { label: "NZ Citizenship Status", value: patient.nz_citizenship_status ?? "N/A" },
    {
      label: "Address",
      value: addressLines.length > 0
        ? (<>{addressLines.map((l, i) => (
            <span key={i}>{l}{i < addressLines.length - 1 && <br />}</span>
          ))}</>)
        : "N/A",
    },
  ];

  const assessmentDisplay: AssessmentDisplay[] = assessments.map((a) => ({
    assessment_id:   a.assessment_id,
    assessment_date: a.assessment_date,
    status:          a.status,
    clinicianName:   formatClinicianFromStaffName(
      a.STAFFstaff_id != null ? staffNameById.get(a.STAFFstaff_id) : undefined
    ),
    alsGrade:        alsGradeByAssessmentId.get(a.assessment_id) ?? null,
  }));

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: BG,
      color: NAVY,
      display: "flex",
      flexDirection: "column",
    }}>
      <Header />

      <div style={{
        padding: "24px 40px 40px",
        display: "grid",
        gridTemplateColumns: "minmax(280px, 1fr) minmax(0, 2fr)",
        gap: 40,
        alignItems: "start",
        flex: 1,
        maxWidth: 1400,
        margin: "0 auto",
        width: "100%",
        boxSizing: "border-box",
      }}>

        {/* ════ LEFT PANEL ════ */}
        <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>

          <p style={{ fontWeight: 700, fontSize: 15, margin: "0 0 10px 0", color: NAVY }}>
            Patient Details
          </p>

          <div style={{
            border: `1px solid ${BORDER}`,
            backgroundColor: "#FFFFFF",
            padding: "20px 22px 24px",
          }}>
            <h1 style={{ fontSize: 28, fontWeight: 600, margin: "0 0 2px 0", lineHeight: 1.25 }}>
              {fullName}
            </h1>
            <p style={{ fontSize: 13, margin: "0 0 18px 0", color: LABEL_COL }}>
              NHI: {patient.nhi_number ?? "N/A"}
            </p>

            <div style={{ display: "grid", rowGap: 8 }}>
              {detailRows.map(({ label, value }) => (
                <div key={label} style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  columnGap: 8,
                  alignItems: "start",
                }}>
                  <span style={{ fontSize: 13, color: LABEL_COL }}>{label}</span>
                  <span style={{ fontSize: 13, color: NAVY, textAlign: "right", lineHeight: 1.5 }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ flex: 1, minHeight: 80 }} />

          <Link href={`/assessment/new?patientId=${patient.patient_id}`} style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            backgroundColor: BTN_PRIMARY,
            color: "#FFFFFF",
            fontWeight: 600,
            fontSize: 15,
            padding: "15px 24px",
            textDecoration: "none",
            letterSpacing: "0.01em",
          }}>
            <span style={{ fontSize: 20, lineHeight: 1, marginTop: -1 }}>+</span>
            New Assessment
          </Link>

          <Link href="/" style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            marginTop: 10,
            backgroundColor: "transparent",
            color: NAVY,
            fontWeight: 500,
            fontSize: 15,
            padding: "13px 24px",
            textDecoration: "none",
            border: `1px solid ${BORDER}`,
          }}>
            ← Back
          </Link>
        </div>

        {/* ════ RIGHT PANEL ════ */}
        {assessmentRes.error ? (
          <div style={{ padding: "16px 0", color: "#DC2626", fontSize: 14 }}>
            Failed to load assessments: {assessmentRes.error.message}
          </div>
        ) : (
          <AssessmentHistoryPanel
            assessments={assessmentDisplay}
            patientName={fullName}
            nhiNumber={patient.nhi_number ?? "N/A"}
          />
        )}

      </div>
    </div>
  );
}
