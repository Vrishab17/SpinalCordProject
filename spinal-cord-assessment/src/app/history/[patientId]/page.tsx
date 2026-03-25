import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import {
  compactAddress,
  formatDateNZ,
} from "@/lib/displayFormatters";

type Props = {
  params: Promise<{
    patientId: string; // NHI or numeric ID
  }>;
};

// -------------------- TYPES --------------------

type PatientRow = {
  patient_id: number;
  nhi_number: string | null;
  date_of_birth: string | null;
  gender: string | null;
  nz_citizenship_status?: string | null;
  place_of_birth?: string | null;
};

type PatientNameRow = {
  name_id: number;
  PATIENTpatient_id: number;
  given_name: string | null;
  family_name: string | null;
};

type PatientAddressRow = {
  address_id: number;
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
  ais_grade?: string | null;
  ais?: string | null;
  clinician_name?: string | null;
};

// -------------------- PAGE --------------------

export default async function Page({ params }: Props) {
  const { patientId } = await params;

  const numericId = Number(patientId);
  const isNumeric = Number.isInteger(numericId);

  // 1️⃣ Fetch patient using NHI or ID
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
      <div style={{ padding: 40 }}>
        <h2>Patient History</h2>
        <p style={{ color: "red" }}>
          Failed to load patient: {patientError.message}
        </p>
      </div>
    );
  }

  if (!patientData) {
    return (
      <div style={{ padding: 40 }}>
        <h2>Patient History</h2>
        <p>
          No patient found for: <strong>{patientId}</strong>
        </p>
      </div>
    );
  }

  const patient = patientData as PatientRow;

  // 2️⃣ Fetch related data in parallel
  const [nameRes, addressRes, assessmentRes] = await Promise.all([
    supabase
      .from("Patient Name")
      .select("*")
      .eq("PATIENTpatient_id", patient.patient_id)
      .limit(1)
      .maybeSingle(),

    supabase
      .from("Patient Address")
      .select("*")
      .eq("PATIENTpatient_id", patient.patient_id)
      .limit(1)
      .maybeSingle(),

    supabase
      .from("Assessment")
      .select("*")
      .eq("PATIENTpatient_id", patient.patient_id)
      .order("assessment_date", { ascending: false }),
  ]);

  const name = nameRes.data as PatientNameRow | null;
  const addressData = addressRes.data as PatientAddressRow | null;
  const assessments = (assessmentRes.data ?? []) as AssessmentRow[];

  // 3️⃣ Derived fields
  const fullName =
    name && (name.family_name || name.given_name)
      ? `${name.family_name ?? ""}${
          name.family_name && name.given_name ? ", " : ""
        }${name.given_name ?? ""}`
      : "Unknown";

  const dob = patient.date_of_birth ?? "N/A";
  const gender = patient.gender ?? "Unknown";
  const citizenship = patient.nz_citizenship_status ?? "Unknown";
  const birthplace = patient.place_of_birth ?? "Unknown";
  const address = compactAddress(addressData);

  // -------------------- UI --------------------

  return (
    <div style={{ display: "flex", gap: 40, padding: 40 }}>
      
      {/* LEFT PANEL */}
      <div style={{ width: 350 }}>
        <h2>Patient Details</h2>

        <div
          style={{
            border: "2px solid #2f3e5c",
            padding: 20,
            background: "white",
          }}
        >
          <h1 style={{ fontSize: 28 }}>{fullName}</h1>
          <p>NHI: {patient.nhi_number ?? "N/A"}</p>

          <div style={{ marginTop: 20, display: "grid", gap: 10 }}>
            <div><strong>Date of Birth:</strong> {formatDateNZ(dob)}</div>
            <div><strong>Gender:</strong> {gender}</div>
            <div><strong>Citizenship:</strong> {citizenship}</div>
            <div><strong>Place of Birth:</strong> {birthplace}</div>
            <div><strong>Address:</strong> {address}</div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div style={{ flex: 1 }}>
        <h2>Assessment History</h2>

        <div
          style={{
            border: "2px solid #2f3e5c",
            background: "white",
          }}
        >
          {/* HEADER */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 2fr 1fr 1fr 1fr",
              padding: 12,
              borderBottom: "2px solid #2f3e5c",
              fontWeight: 600,
            }}
          >
            <div>DATE</div>
            <div>CLINICIAN</div>
            <div>AIS</div>
            <div>STATUS</div>
            <div></div>
          </div>

          {/* ERROR */}
          {assessmentRes.error && (
            <div style={{ padding: 12, color: "red" }}>
              Failed to load assessments: {assessmentRes.error.message}
            </div>
          )}

          {/* EMPTY */}
          {!assessmentRes.error && assessments.length === 0 && (
            <div style={{ padding: 12, color: "#6B7280" }}>
              No assessments found
            </div>
          )}

          {/* ROWS */}
          {assessments.map((a) => (
            <div
              key={a.assessment_id}
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 2fr 1fr 1fr 1fr",
                padding: 12,
                borderBottom: "1px solid #ddd",
                alignItems: "center",
              }}
            >
              <div>{formatDateNZ(a.assessment_date)}</div>
              <div>{a.clinician_name ?? "Unassigned"}</div>
              <div>Grade {a.ais_grade ?? a.ais ?? "N/A"}</div>
              <div>{a.status ?? "Unknown"}</div>

              <div>
                <Link href={`/assessment?assessmentId=${a.assessment_id}`}>
                  Open
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}