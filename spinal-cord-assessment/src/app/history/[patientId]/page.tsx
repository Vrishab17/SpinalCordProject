
import Link from "next/link";
import Header from "@/components/layout/Header";
import AssessmentHistoryClient from "@/components/history/AssessmentHistory";
import { supabase } from "@/lib/supabaseClient";
import AssessmentHistoryPanel from "./AssessmentHistoryPanel";
import type { AssessmentDisplay } from "./AssessmentHistoryPanel";

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = {
<<<<<<< Updated upstream
  params: Promise<{ patientId: string }>;
=======
  params: Promise<{
    patientId: string;
  }>;
>>>>>>> Stashed changes
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
  PATIENTpatient_id: number;
  STAFFstaff_id: number | null;
  assessment_date: string | null;
  status: string | null;
<<<<<<< Updated upstream
  STAFFstaff_id: number;
=======
  current_version: number | null;
  injury_date: string | null;
};

type StaffNameRow = {
  name_id: number;
  STAFFstaff_id: number;
  family_name: string | null;
  given_name: string | null;
  prefix: string | null;
};

type ExamRow = {
  exam_id: number;
  ASSESSMENTassessment_id: number;
};

type ClassificationRow = {
  EXAMexam_id: number;
  ais_grade: string | null;
>>>>>>> Stashed changes
};

type ExamRow = {
  exam_id: number;
  ASSESSMENTassessment_id: number;
};

<<<<<<< Updated upstream
/** Row from `Classification Result`; UI prints `als_grade` as GRADE X. */
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

/** Keep selects narrow — less data over the wire and faster PostgREST work. */
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

// ─── Design tokens ────────────────────────────────────────────────────────────

const NAVY         = "#15284C";
const TEAL_LOGO    = "#1FA199";
const TEAL_BORDER  = "#2D9CDB";
const TABLE_BORDER = "#15284C";
const BG           = "#EDE8DF";
const LABEL_COL    = "#6B7A96";
const OPEN_BG      = "#D9DDE3";
const HEADER_MUTED = "#CBD5E1";

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
=======
function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("en-NZ", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function calculateAge(dateOfBirth: string | null): string {
  if (!dateOfBirth) return "N/A";
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return "N/A";
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return `${age} Years`;
}

function formatClinicianName(staffName: StaffNameRow | undefined): string {
  if (!staffName) return "Unassigned";
  const prefix = staffName.prefix?.trim() ? `${staffName.prefix.trim()}.` : "";
  const initial = staffName.given_name?.trim()
    ? ` ${staffName.given_name.trim()[0]}.`
    : "";
  const family = staffName.family_name?.trim() ?? "";
  return `${prefix}${initial} ${family}`.trim() || "Unassigned";
>>>>>>> Stashed changes
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

// ─── Sub-components ───────────────────────────────────────────────────────────

function Navbar() {
  return (
    <nav style={{
      backgroundColor: NAVY,
      padding: "0 40px",
      height: 72,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexShrink: 0,
    }}>
      <div>
        <div style={{ color: "#fff", fontWeight: 700, fontSize: 22, lineHeight: 1.2 }}>
          Health New Zealand
        </div>
        <div style={{ color: TEAL_LOGO, fontWeight: 600, fontSize: 15 }}>Te Whatu Ora</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, color: HEADER_MUTED }}>
        <span style={{ fontSize: 15 }}>Dr. J. Doe</span>
        <div style={{
          width: 40, height: 40,
          borderRadius: "50%",
          border: `2px solid ${HEADER_MUTED}`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={HEADER_MUTED} strokeWidth="2">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
          </svg>
        </div>
      </div>
    </nav>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function Page({ params }: Props) {
  const { patientId } = await params;
  const numericId = Number(patientId);
  const isNumeric = Number.isInteger(numericId) && !Number.isNaN(numericId);

<<<<<<< Updated upstream
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
        <div style={{ minHeight: "100vh", backgroundColor: BG, fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
          <Navbar />
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
        <div style={{ minHeight: "100vh", backgroundColor: BG, fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
          <Navbar />
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
  const staffIds = [...new Set(assessments.map((a) => a.STAFFstaff_id))];
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
=======
  const { data: patientData, error: patientError } = await (isNumeric
    ? supabase
        .from("Patient")
        .select("*")
        .eq("patient_id", numericId)
        .maybeSingle()
    : supabase
        .from("Patient")
        .select("*")
        .eq("nhi_number", patientId)
        .maybeSingle());

  if (patientError) {
    return (
      <div>
        <Header />
        <div style={{ padding: 40 }}>
          <h2>Patient History</h2>
          <p style={{ color: "red" }}>
            Failed to load patient: {patientError.message}
          </p>
        </div>
      </div>
    );
  }

  if (!patientData) {
    return (
      <div>
        <Header />
        <div style={{ padding: 40 }}>
          <h2>Patient History</h2>
          <p>
            No patient found for: <strong>{patientId}</strong>
          </p>
        </div>
      </div>
    );
>>>>>>> Stashed changes
  }

  // ── AIS grade: Assessment → Exam → Classification Result (als_grade) ──
  const assessmentIds = assessments.map((a) => a.assessment_id);
  /** assessment_id → ALS grade from Classification Result */
  const alsGradeByAssessmentId = new Map<number, string | null>();

<<<<<<< Updated upstream
  if (assessmentIds.length > 0) {
    const { data: examRows } = await supabase
      .from("Exam")
      .select(SEL.exam)
      .in("ASSESSMENTassessment_id", assessmentIds);
=======
  // Fetch related data in parallel
  const [nameRes, addressRes, assessmentRes] = await Promise.all([
    supabase
      .from("Patient Name")
      .select("*")
      .eq("PATIENTpatient_id", patient.patient_id)
      .limit(1)
      .maybeSingle(),
>>>>>>> Stashed changes

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

<<<<<<< Updated upstream
      for (const [assessmentId, examId] of bestExamByAssessment) {
        alsGradeByAssessmentId.set(assessmentId, alsByExam.get(examId) ?? null);
      }
    }
  }

  // ── Derived values ──
  const fullName = name && (name.family_name || name.given_name)
    ? `${name.family_name ?? ""}${name.family_name && name.given_name ? ", " : ""}${name.given_name ?? ""}`
    : "Unknown";
=======
  // Fetch clinician names for all assessments
  const staffIds = [
    ...new Set(
      assessments.map((a) => a.STAFFstaff_id).filter(Boolean) as number[]
    ),
  ];
  const staffNameMap = new Map<number, StaffNameRow>();

  if (staffIds.length > 0) {
    const { data: staffNames } = await supabase
      .from("Staff Name")
      .select("*")
      .in("STAFFstaff_id", staffIds);
    if (staffNames) {
      for (const sn of staffNames as StaffNameRow[]) {
        staffNameMap.set(sn.STAFFstaff_id, sn);
      }
    }
  }

  // Fetch AIS grades: Assessment -> Exam -> Classification Result
  const assessmentIds = assessments.map((a) => a.assessment_id);
  const aisGradeMap = new Map<number, string>();

  if (assessmentIds.length > 0) {
    const { data: exams } = await supabase
      .from("Exam")
      .select("exam_id, ASSESSMENTassessment_id")
      .in("ASSESSMENTassessment_id", assessmentIds);

    if (exams && exams.length > 0) {
      const examRows = exams as ExamRow[];
      const examIds = examRows.map((e) => e.exam_id);

      const { data: classifications } = await supabase
        .from("Classification Result")
        .select("EXAMexam_id, ais_grade")
        .in("EXAMexam_id", examIds);

      if (classifications) {
        const classRows = classifications as ClassificationRow[];
        const examToAis = new Map<number, string>();
        for (const c of classRows) {
          if (c.ais_grade) examToAis.set(c.EXAMexam_id, c.ais_grade.trim());
        }
        for (const e of examRows) {
          const grade = examToAis.get(e.exam_id);
          if (grade) aisGradeMap.set(e.ASSESSMENTassessment_id, grade);
        }
      }
    }
  }

  // Build enriched assessments for the client component
  const enrichedAssessments = assessments.map((a) => ({
    assessment_id: a.assessment_id,
    assessment_date: a.assessment_date,
    status: a.status,
    clinician_name: formatClinicianName(
      a.STAFFstaff_id ? staffNameMap.get(a.STAFFstaff_id) : undefined
    ),
    ais_grade: aisGradeMap.get(a.assessment_id) ?? "N/A",
  }));

  // Derived patient fields
  const fullName =
    name && (name.family_name || name.given_name)
      ? `${name.family_name ?? ""}${
          name.family_name && name.given_name ? ", " : ""
        }${name.given_name ?? ""}`
      : "Unknown";

  const age = calculateAge(patient.date_of_birth);
  const gender = patient.gender ?? "Unknown";
  const citizenship = patient.nz_citizenship_status ?? "Unknown";
  const birthplace = patient.place_of_birth ?? "Unknown";

  const addressLines = addressData
    ? [
        addressData.line1,
        addressData.line2,
        addressData.suburb,
        addressData.city,
        addressData.country,
        addressData.postal_code?.toString(),
      ].filter(Boolean)
    : [];
>>>>>>> Stashed changes

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

  // ── Flat assessment display list (passed to Client Component) ──
  const assessmentDisplay: AssessmentDisplay[] = assessments.map((a) => ({
    assessment_id:   a.assessment_id,
    assessment_date: a.assessment_date,
    status:          a.status,
    clinicianName:   formatClinicianFromStaffName(staffNameById.get(a.STAFFstaff_id)),
    alsGrade:        alsGradeByAssessmentId.get(a.assessment_id) ?? null,
  }));

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
<<<<<<< Updated upstream
    <div style={{
      minHeight: "100vh",
      backgroundColor: BG,
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      color: NAVY,
      display: "flex",
      flexDirection: "column",
    }}>
      <Navbar />

      {/* ~1/3 + ~2/3 columns (mockup) */}
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

          {/* Patient card */}
          <div style={{
            border: `2px solid ${TEAL_BORDER}`,
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

          {/* Spacer */}
          <div style={{ flex: 1, minHeight: 80 }} />

          {/* + New Assessment */}
          <Link href={`/assessment/new?patientId=${patient.patient_id}`} style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            backgroundColor: NAVY,
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

          {/* ← Back */}
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
            border: `1px solid ${TABLE_BORDER}`,
          }}>
            ← Back
          </Link>
=======
    <div>
      <Header />

      <div style={{ display: "flex", gap: 40, padding: "30px 40px" }}>
        {/* LEFT PANEL */}
        <div style={{ width: 370, flexShrink: 0 }}>
          <h2
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: "#33476D",
              marginBottom: 12,
            }}
          >
            Patient Details
          </h2>

          <div
            style={{
              border: "2px solid #2f3e5c",
              padding: 24,
              background: "white",
            }}
          >
            <h1 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 4px 0" }}>
              {fullName}
            </h1>
            <p
              style={{
                fontSize: 14,
                color: "#555",
                margin: "0 0 20px 0",
                fontWeight: 600,
              }}
            >
              NHI: {patient.nhi_number ?? "N/A"}
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "auto 1fr",
                gap: "8px 16px",
                fontSize: 14,
              }}
            >
              <div style={{ fontWeight: 500 }}>Date of Birth</div>
              <div style={{ textAlign: "right" }}>
                {formatDate(patient.date_of_birth)}
              </div>

              <div style={{ fontWeight: 500 }}>Age</div>
              <div style={{ textAlign: "right" }}>{age}</div>

              <div style={{ fontWeight: 500 }}>Gender</div>
              <div style={{ textAlign: "right" }}>{gender}</div>

              <div style={{ fontWeight: 500 }}>Citizenship</div>
              <div style={{ textAlign: "right" }}>{citizenship}</div>

              <div style={{ fontWeight: 500 }}>Place of Birth</div>
              <div style={{ textAlign: "right" }}>{birthplace}</div>

              <div style={{ fontWeight: 500 }}>Address</div>
              <div style={{ textAlign: "right" }}>
                {addressLines.length > 0
                  ? addressLines.map((line, i) => (
                      <span key={i}>
                        {line}
                        {i < addressLines.length - 1 && <br />}
                      </span>
                    ))
                  : "N/A"}
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: 24,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <Link
              href={`/assessment?patientId=${patient.patient_id}`}
              style={{
                display: "block",
                textAlign: "center",
                padding: "14px 0",
                background: "#2A7D5F",
                color: "white",
                fontSize: 16,
                fontWeight: 600,
                borderRadius: 4,
                textDecoration: "none",
                border: "none",
              }}
            >
              + New Assessment
            </Link>

            <Link
              href="/"
              style={{
                display: "block",
                textAlign: "center",
                padding: "14px 0",
                background: "white",
                color: "#2f3e5c",
                fontSize: 16,
                fontWeight: 500,
                borderRadius: 4,
                textDecoration: "none",
                border: "2px solid #2f3e5c",
              }}
            >
              &larr; Back
            </Link>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <AssessmentHistoryClient
            assessments={enrichedAssessments}
            hasError={!!assessmentRes.error}
            errorMessage={assessmentRes.error?.message}
          />
>>>>>>> Stashed changes
        </div>

        {/* ════ RIGHT PANEL ════ */}
        {assessmentRes.error ? (
          <div style={{ padding: "16px 0", color: "#DC2626", fontSize: 14 }}>
            Failed to load assessments: {assessmentRes.error.message}
          </div>
        ) : (
          <AssessmentHistoryPanel assessments={assessmentDisplay} />
        )}

      </div>
    </div>
  );
}
